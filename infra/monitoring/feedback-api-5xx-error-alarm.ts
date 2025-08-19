import { Construct } from 'constructs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { aws_cloudwatch_actions, Duration } from 'aws-cdk-lib';
import { FeedbackApiAlarmProps } from './types';

export class FeedbackApi5xxErrorAlarm extends Construct {
  constructor(scope: Construct, id: string, props: FeedbackApiAlarmProps) {
    super(scope, id);

    const { alertTopic, restApiName } = props;

    const metric = new cloudwatch.Metric({
      metricName: '5XXError',
      namespace: 'AWS/ApiGateway',
      period: Duration.minutes(15),
      statistic: 'Sum',
      dimensionsMap: {
        Name: 'ApiName',
        Value: restApiName
      }
    });

    const feedbackApi5xxErrorsAlarm = new cloudwatch.Alarm(this, id, {
      metric,
      evaluationPeriods: 1,
      threshold: 2,
      actionsEnabled: true,
      alarmDescription:
        'Alarm when the Feedback API returns at least 2 5XX errors in 15 minutes',
      alarmName: 'Feedback API - 5XX Errors',
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      datapointsToAlarm: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    feedbackApi5xxErrorsAlarm.addAlarmAction(
      new aws_cloudwatch_actions.SnsAction(alertTopic)
    );
  }
}
