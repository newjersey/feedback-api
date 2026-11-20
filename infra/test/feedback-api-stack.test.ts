import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, it } from 'vitest';
import { FeedbackApiStack } from '../lib/feedback-api-stack';

describe('FeedbackApiStack', () => {
  const app = new cdk.App();
  const stack = new FeedbackApiStack(app, 'TestFeedbackApiStack', {
    pathToSrcDirectory: path.join(__dirname, '../../src')
  });
  const template = Template.fromStack(stack);

  // At the 128MB default the functions ran near their memory cap
  it.each([
    'feedback-api-rating',
    'feedback-api-comment',
    'feedback-api-email'
  ])('gives %s 256MB of memory', (functionName) => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: functionName,
      MemorySize: 256
    });
  });
});
