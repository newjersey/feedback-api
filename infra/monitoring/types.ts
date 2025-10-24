import * as sns from 'aws-cdk-lib/aws-sns';

export interface FeedbackApiAlarmProps {
  restApiName: string;
  stageName: string;
  alertTopic: sns.ITopic;
}
