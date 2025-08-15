import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { FeedbackApiStack } from '../lib/feedback-api-stack';
import path from 'path';

describe('Feedback API Stack', () => {
  let app: App;
  let stack: Stack;
  let template: Template;

  beforeEach(() => {
    app = new App();

    const currentWorkingDir = path.basename(path.resolve(process.cwd()));
    const rootDir = path.resolve(__dirname, '../../');
    if (currentWorkingDir !== rootDir) {
      throw Error(
        `Use the npm scripts in the package.json to make sure you're running tests from the project root, otherwise the pathToSrcDirectory argument used to instantiate the FeedbackApiStack in the beforeEach will be wrong. Currently the working directory is "${currentWorkingDir}". (The project root directory should be: "${rootDir}").`
      );
    }

    stack = new FeedbackApiStack(app, 'TestFeedbackApiStack', {
      pathToSrcDirectory: './src'
    });

    template = Template.fromStack(stack);
  });

  it('creates an SNS topic', () => {
    template.hasResourceProperties('AWS::SNS::Topic', {
      TopicName: 'slack-platform-eng-alerts'
    });
  });

  it('creates an SNS subscription for Slack endpoint', () => {
    template.hasResourceProperties('AWS::SNS::Subscription', {
      Protocol: 'email',
      Endpoint: 'platform-eng-alerts-aaaapo5zcsgpp4xexgu4ggjvje@njcio.slack.com'
    });
  });

  it.each(['4XXError', '5XXError'])(
    'creates a CloudWatch alarm tracking the %s metric',
    (metricName) => {
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        MetricName: metricName,
        Threshold: 2,
        EvaluationPeriods: 1,
        Period: 900 // seconds
      });
    }
  );
});
