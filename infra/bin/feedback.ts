import * as cdk from 'aws-cdk-lib';
import { FeedbackApiStack } from '../lib/feedback-api-stack';
import { FeedbackDbStack } from '../lib/feedback-db-stack';

const PATH_TO_SRC_DIRECTORY = '../src/';

const app = new cdk.App();

const env = {
  account: '152320432929',
  region: 'us-east-1'
};

new FeedbackDbStack(app, 'FeedbackDbStack', {
  env
});

new FeedbackApiStack(app, 'FeedbackApiStack', {
  pathToSrcDirectory: PATH_TO_SRC_DIRECTORY,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
