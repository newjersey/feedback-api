import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class FeedbackApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaExecutionRole = new iam.Role(
      this,
      'FeedbackApiLambdaExecutionRole',
      {
        roleName: 'FeedbackApiLambdaExecutionRole',
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        description: 'Shared execution role for Feedback API Lambda functions',
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSLambdaBasicExecutionRole'
          )
        ],
        inlinePolicies: {
          feedbackApiLambdaPolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  'ssm:GetParameter',
                  'ssm:GetParameters',
                  'ssm:GetParametersByPath',
                  'ssm:DescribeParameters'
                ],
                resources: [
                  `arn:aws:ssm:${this.region}:${this.account}:parameter/feedback-api/*`
                ]
              }),
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['kms:Decrypt'],
                resources: [`arn:aws:kms:${this.region}:${this.account}:key/*`]
              }),
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['comprehend:DetectPiiEntities'],
                resources: [`*`]
              })
            ]
          })
        }
      }
    );

    const ratingFunction = new NodejsFunction(this, 'rating', {
      entry: '../src/functions/rating/rating.ts',
      functionName: 'feedback-api-rating',
      handler: 'handler',
      role: lambdaExecutionRole,
      runtime: lambda.Runtime.NODEJS_20_X
    });

    const commentFunction = new NodejsFunction(this, 'comment', {
      entry: '../src/functions/comment/comment.ts',
      functionName: 'feedback-api-comment',
      handler: 'handler',
      role: lambdaExecutionRole,
      runtime: lambda.Runtime.NODEJS_20_X
    });

    const emailFunction = new NodejsFunction(this, 'email', {
      entry: '../src/functions/email/email.ts',
      functionName: 'feedback-api-email',
      handler: 'handler',
      role: lambdaExecutionRole,
      runtime: lambda.Runtime.NODEJS_20_X
    });

    const functions = [
      { name: 'rating', handler: ratingFunction, endpointType: 'POST' },
      { name: 'comment', handler: commentFunction, endpointType: 'POST' },
      { name: 'email', handler: emailFunction, endpointType: 'POST' }
    ];

    const feedbackApi = new apigw.RestApi(this, 'feedback-api', {
      restApiName: 'Feedback API',
      description: 'API for Feedback Widget functions'
    });

    functions.forEach(({ name, handler, endpointType }) => {
      const resource = feedbackApi.root.addResource(name);
      resource.addMethod(
        endpointType,
        new apigw.LambdaIntegration(handler, {})
      );
    });
  }
}
