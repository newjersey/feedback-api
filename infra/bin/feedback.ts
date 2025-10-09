import * as cdk from 'aws-cdk-lib';
import { FeedbackApiStack } from '../lib/feedback-api-stack';
import { DEPLOYMENT_CONFIGS } from '../lib/deployment-config';
import { FeedbackDbStack } from '../lib/feedback-db-stack';

const PATH_TO_SRC_DIRECTORY = '../src/';

const app = new cdk.App();

new FeedbackDbStack(app, 'DevFeedbackDbStack', {
  env: {
    account: DEPLOYMENT_CONFIGS.dev.accountId,
    region: DEPLOYMENT_CONFIGS.dev.region
  },
  vpcId: DEPLOYMENT_CONFIGS.dev.vpcId,
  serverlessV2Capacity: DEPLOYMENT_CONFIGS.dev.serverlessV2Capacity
});

new FeedbackDbStack(app, 'ProdFeedbackDbStack', {
  env: {
    account: DEPLOYMENT_CONFIGS.prod.accountId,
    region: DEPLOYMENT_CONFIGS.prod.region
  },
  vpcId: DEPLOYMENT_CONFIGS.prod.vpcId,
  serverlessV2Capacity: DEPLOYMENT_CONFIGS.prod.serverlessV2Capacity
});

new FeedbackApiStack(app, 'FeedbackApiStack', {
  pathToSrcDirectory: PATH_TO_SRC_DIRECTORY
});
