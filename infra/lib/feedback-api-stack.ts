import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as sns from 'aws-cdk-lib/aws-sns';
import { FeedbackApi5xxErrorAlarm as FeedbackApi5xxErrorAlarm } from '../monitoring/feedback-api-5xx-error-alarm';
import { FeedbackApi4xxErrorAlarm } from '../monitoring/feedback-api-4xx-error-alarm';

export class FeedbackApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
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
      { name: 'rating', handler: ratingFunction },
      { name: 'comment', handler: commentFunction },
      { name: 'email', handler: emailFunction }
    ];

    const feedbackApi = new apigw.RestApi(this, 'feedback-api', {
      restApiName: 'Feedback API',
      description: 'API for Feedback Widget functions'
    });

    functions.forEach(({ name, handler }) => {
      const resource = feedbackApi.root.addResource(name);
      resource.addMethod('POST', new apigw.LambdaIntegration(handler, {}));
      resource.addMethod('OPTIONS', new apigw.LambdaIntegration(handler, {}));

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

    const alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: 'slack-platform-eng-alerts'
    });

    alertTopic.addSubscription(
      new cdk.aws_sns_subscriptions.EmailSubscription(
        'platform-eng-alerts-aaaapo5zcsgpp4xexgu4ggjvje@njcio.slack.com'
      )
    );

    new FeedbackApi5xxErrorAlarm(this, 'FeedbackApi5XXErrorAlarm', {
      alertTopic: alertTopic,
      restApiName: feedbackApi.restApiName
    });

    new FeedbackApi4xxErrorAlarm(this, 'FeedbackApi4XX', {
      alertTopic: alertTopic,
      restApiName: feedbackApi.restApiName
    });
  }
}
