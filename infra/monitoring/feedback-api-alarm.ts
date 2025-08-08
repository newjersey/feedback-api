import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { aws_cloudwatch_actions, Duration } from 'aws-cdk-lib';

interface FeedbackApiAlarmsProps {
  alertTopic: sns.ITopic;
}

export class FeedbackApiAlarm extends Construct {
  constructor(scope: Construct, id: string, props: FeedbackApiAlarmsProps) {
    super(scope, id);

    const { alertTopic } = props;

    const metric = new cloudwatch.Metric({
      metricName: 'Feedback API-Comments-Error',
      namespace: 'Feedback API Monitoring',
      period: Duration.minutes(15),
      statistic: 'Sum'
    });

    const feedbackApiCommentAlarm = new cloudwatch.Alarm(this, 'CommentAlarm', {
      metric,
      evaluationPeriods: 1,
      threshold: 2,
      actionsEnabled: true,
      alarmDescription:
        'Alarm when the feedback comment Lambda logs at least 2 errors in 15 minutes',
      alarmName: 'Feedback API - Comments - Error',
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      datapointsToAlarm: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    feedbackApiCommentAlarm.addAlarmAction(
      new aws_cloudwatch_actions.SnsAction(alertTopic)
    );
  }
}
