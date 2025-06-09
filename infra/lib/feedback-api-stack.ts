import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class FeedbackApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new NodejsFunction(this, 'rating', {
      entry: '../src/functions/rating/index.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X
    });

    new apigw.LambdaRestApi(this, 'feedback-api', {
      handler: fn
    });
  }
}