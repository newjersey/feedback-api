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
                actions: ['comprehend:DetectPiiEntities'],
                resources: [`*`]
              })
            ]
          })
        }
      }
    );

    const ratingFunction = new NodejsFunction(this, 'rating', {
      entry: '../src/functions/rating.ts',
      functionName: 'feedback-api-rating',
      role: lambdaExecutionRole,
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: cdk.Duration.seconds(30)
    });

    const commentFunction = new NodejsFunction(this, 'comment', {
      entry: '../src/functions/comment.ts',
      functionName: 'feedback-api-comment',
      role: lambdaExecutionRole,
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: cdk.Duration.seconds(30)
    });

    const emailFunction = new NodejsFunction(this, 'email', {
      entry: '../src/functions/email.ts',
      functionName: 'feedback-api-email',
      role: lambdaExecutionRole,
      runtime: lambda.Runtime.NODEJS_22_X,
      timeout: cdk.Duration.seconds(30)
    });

    const functions = [
      { name: 'rating', handler: ratingFunction, method: 'POST' },
      { name: 'comment', handler: commentFunction, method: 'POST' },
      { name: 'email', handler: emailFunction, method: 'POST' }
    ];

    const feedbackApi = new apigw.RestApi(this, 'feedback-api', {
      restApiName: 'Feedback API',
      description: 'API for Feedback Widget functions'
    });

    functions.forEach(({ name, handler, method }) => {
      const resource = feedbackApi.root.addResource(name);
      resource.addCorsPreflight({
        allowOrigins: ['*'],
        allowMethods: ['OPTIONS,POST'],
        allowHeaders: [
          'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,X-Amzn-Trace-Id'
        ],
        allowCredentials: false
      });
      resource.addMethod(method, new apigw.LambdaIntegration(handler, {}), {
        methodResponses: [{ statusCode: '200' }]
      });

      new cdk.CfnOutput(this, `${name}FunctionArnOutput`, {
        key: `${name}FunctionArn`,
        exportName: `${name}FunctionArn`,
        value: handler.functionArn
      });
    });

    new cdk.CfnOutput(this, 'ApiUrlOutput', {
      key: 'feedbackApiUrl',
      exportName: 'feedbackApiUrl',
      value: feedbackApi.url
    });
  }
}
