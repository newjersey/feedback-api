import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FeedbackApiAlarm } from '../monitoring/feedback-api-alarm';
import * as sns from 'aws-cdk-lib/aws-sns';

export class FeedbackApiAlarmStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: 'slack-platform-eng-alerts'
    });

    alertTopic.addSubscription(
      new cdk.aws_sns_subscriptions.EmailSubscription(
        'platform-eng-alerts-aaaapo5zcsgpp4xexgu4ggjvje@njcio.slack.com'
      )
    );

    new FeedbackApiAlarm(this, 'FeedbackApiAlarm', {
      alertTopic
    });
  }
}
