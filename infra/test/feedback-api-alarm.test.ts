import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { FeedbackApiAlarm } from '../monitoring/feedback-api-alarm';
import * as sns from 'aws-cdk-lib/aws-sns';
import { FeedbackApiAlarmStack } from '../lib/feedback-api-alarm-stack';

describe('FeedbackApiAlarm', () => {
  let app: App;
  let stack: Stack;
  let template: Template;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestAlarmStack');

    const fakeEnv = { account: '123456789012', region: 'us-east-1' };

    const mockedAlertTopic = {
      topicArn: 'arn:aws:sns:us-east-1:123456789012:feedback--api-alarm-test'
    } as sns.ITopic;

    new FeedbackApiAlarm(stack, 'FeedbackApiAlarm', {
      alertTopic: mockedAlertTopic
    });

    const alarmStack = new FeedbackApiAlarmStack(app, 'FeedbackApiAlarmStack', {
      env: fakeEnv
    });

    template = Template.fromStack(alarmStack);
  });

  it('creates a CloudWatch alarm', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      MetricName: 'Feedback API-Comments-Error',
      Threshold: 2,
      EvaluationPeriods: 1,
      Period: 900
    });
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
});
