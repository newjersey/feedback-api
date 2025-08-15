import { Construct } from 'constructs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { aws_cloudwatch_actions, Duration } from 'aws-cdk-lib';
import { FeedbackApiAlarmProps } from './types';

export class FeedbackApi4XXErrorAlarm extends Construct {
  constructor(scope: Construct, id: string, props: FeedbackApiAlarmProps) {
    super(scope, id);

    const { alertTopic } = props;

    const metric = new cloudwatch.Metric({
      metricName: '4XXError',
      namespace: 'AWS/ApiGateway',
      period: Duration.minutes(15),
      statistic: 'Sum',
      dimensionsMap: {
        Name: 'ApiName',
        Value: props.restApiName
      }
    });

    const feedbackApi5XXErrorsAlarm = new cloudwatch.Alarm(this, id, {
      metric,
      evaluationPeriods: 1,
      threshold: 2,
      actionsEnabled: true,
      alarmDescription:
        'Alarm when the Feedback API returns at least 2 4XX errors in 15 minutes',
      alarmName: 'Feedback API - 4XX Errors',
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      datapointsToAlarm: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    feedbackApi5XXErrorsAlarm.addAlarmAction(
      new aws_cloudwatch_actions.SnsAction(alertTopic)
    );
  }
}
