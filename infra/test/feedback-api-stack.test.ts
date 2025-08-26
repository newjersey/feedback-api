import { App } from 'aws-cdk-lib';
import { Capture, Template } from 'aws-cdk-lib/assertions';
import { FeedbackApiStack } from '../lib/feedback-api-stack';
import path from 'path';
import * as ssm from 'aws-cdk-lib/aws-ssm';

describe('Feedback API Stack', () => {
  const createStackAndTemplate = (): {
    stack: FeedbackApiStack;
    template: Template;
  } => {
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

    return { stack: stack, template: Template.fromStack(stack) };
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('creates a REST API that enables CORS for the preflight request', () => {
    const { template } = createStackAndTemplate();

    const optionMethods = template.findResources('AWS::ApiGateway::Method', {
      Properties: {
        HttpMethod: 'OPTIONS'
      }
    });

    for (const logicalId in optionMethods) {
      const integration: {
        IntegrationResponses: object[];
        RequestTemplates: object;
        Type: string;
      } = optionMethods[logicalId]['Properties']['Integration'];

      const integrationResponses = integration['IntegrationResponses'];

      expect(integrationResponses).toContainEqual({
        StatusCode: '204',
        ResponseParameters: expect.objectContaining({
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Methods':
            "'OPTIONS,POST'"
        })
      });
    }
  });

  it('creates an SNS topic', () => {
    const { template } = createStackAndTemplate();
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

    const { stack, template } = createStackAndTemplate();

    expect(valueForStringParameterMock).toHaveBeenCalledWith(
      stack,
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

    valueForStringParameterMock.mockRestore();
  });

  it.each(['4XXError', '5XXError'])(
    'creates a CloudWatch alarm tracking the %s metric',
    (metricName) => {
      const { template } = createStackAndTemplate();
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        MetricName: metricName,
        Threshold: 2,
        EvaluationPeriods: 1,
        Period: 900 // seconds
      });
    }
  );
});
