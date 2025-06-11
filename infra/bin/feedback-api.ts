import * as cdk from 'aws-cdk-lib';
import { FeedbackApiStack } from '../lib/feedback-api-stack';

const app = new cdk.App();
new FeedbackApiStack(app, 'FeedbackApiStack', {});
