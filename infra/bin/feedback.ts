import * as cdk from 'aws-cdk-lib';
import { FeedbackApiStack } from '../lib/feedback-api-stack';
import { FeedbackDbStack } from '../lib/feedback-db-stack';
import { config } from 'dotenv';

config();

const app = new cdk.App();

const env = {
  account: '152320432929',
  region: 'us-east-1'
};

new FeedbackDbStack(app, 'FeedbackDbStack', {
  env
});

new FeedbackApiStack(app, 'FeedbackApiStack', {});
