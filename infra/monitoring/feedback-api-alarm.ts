import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { aws_cloudwatch_actions, Duration } from 'aws-cdk-lib';

interface FeedbackApi500XErrorAlarmProps {
  restApiName: string;
  alertTopic: sns.ITopic;
}

export class FeedbackApi500XErrorAlarm extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: FeedbackApi500XErrorAlarmProps
  ) {
    super(scope, id);

    const { alertTopic } = props;

    const metric = new cloudwatch.Metric({
      metricName: '5XXError',
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
        'Alarm when the feedback comment Lambda logs at least 2 errors in 15 minutes',
      alarmName: 'Feedback API - 5XX Errors',
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      datapointsToAlarm: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    feedbackApi5XXErrorsAlarm.addAlarmAction(
      new aws_cloudwatch_actions.SnsAction(alertTopic)
    );
  }
}
