import { App } from 'aws-cdk-lib';
import { Capture, Template } from 'aws-cdk-lib/assertions';
import { FeedbackApiStack } from '../lib/feedback-api-stack';
import path from 'path';
import * as ssm from 'aws-cdk-lib/aws-ssm';

describe('Feedback API Stack', () => {
  const createTemplate = () => {
    const app = new App();
    const currentWorkingDir = path.basename(path.resolve(process.cwd()));
    const rootDir = path.basename(path.resolve(__dirname, '../../'));
    if (currentWorkingDir !== rootDir) {
      throw Error(
        `Use the npm scripts in the package.json to make sure you're running tests from the project root, otherwise the pathToSrcDirectory argument used to instantiate the FeedbackApiStack in the beforeEach will be wrong. Currently the working directory is "${currentWorkingDir}". (The project root directory should be: "${rootDir}").`
      );
    }

    const stack = new FeedbackApiStack(app, 'TestFeedbackApiStack', {
      pathToSrcDirectory: './src'
    });

    return Template.fromStack(stack);
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('creates an SNS topic', () => {
    const template = createTemplate();
    template.hasResourceProperties('AWS::SNS::Topic', {
      TopicName: 'slack-platform-eng-alerts'
    });
  });

  it('creates an SNS subscription for Slack endpoint', () => {
    const valueForStringParameterMock = jest.spyOn(
      ssm.StringParameter,
      'valueForStringParameter'
    );
    const ssmParamName =
      '/shared/alarms/subscriptions/slack-emails/platform-eng-alerts';

    const template = createTemplate();

    expect(valueForStringParameterMock).toHaveBeenCalledWith(
      expect.any(FeedbackApiStack),
      ssmParamName
    );

    const endpointCapture = new Capture();

    template.hasResourceProperties('AWS::SNS::Subscription', {
      Protocol: 'email',
      Endpoint: endpointCapture
    });

    const ssmParamNameAlphanumericOnly = ssmParamName.replace(/\W/g, '');

    expect(endpointCapture.asObject()).toEqual({
      Ref: expect.stringContaining(
        `SsmParameterValue${ssmParamNameAlphanumericOnly}`
      )
    });
  });

  it.each(['4XXError', '5XXError'])(
    'creates a CloudWatch alarm tracking the %s metric',
    (metricName) => {
      const template = createTemplate();
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        MetricName: metricName,
        Threshold: 2,
        EvaluationPeriods: 1,
        Period: 900 // seconds
      });
    }
  );
});
