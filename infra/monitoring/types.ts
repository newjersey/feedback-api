import * as sns from 'aws-cdk-lib/aws-sns';

export interface FeedbackApiAlarmProps {
  restApiName: string;
  alertTopic: sns.ITopic;
}
