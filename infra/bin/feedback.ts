import * as cdk from 'aws-cdk-lib';
import { FeedbackApiStack } from '../lib/feedback-api-stack';

const PATH_TO_SRC_DIRECTORY = '../src/';

const app = new cdk.App();

new FeedbackApiStack(app, 'FeedbackApiStack', {
  pathToSrcDirectory: PATH_TO_SRC_DIRECTORY
});
