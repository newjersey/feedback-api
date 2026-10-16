import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class IamStack extends cdk.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const githubIdP = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'FeedbackApiGithubIdP',
      `arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`
    );

    const githubPrincipal = new iam.OpenIdConnectPrincipal(githubIdP, {
      StringEquals: {
        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
      },
      StringLike: {
        'token.actions.githubusercontent.com:sub':
          'repo:newjersey/feedback-api:*'
      }
    });

    new iam.Role(this, 'FeedbackApiDeploymentRole', {
      roleName: 'FeedbackApiDeploymentRole',
      assumedBy: githubPrincipal,
      inlinePolicies: {
        DeploymentPermissionsPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['sts:AssumeRole'],
              resources: [`arn:aws:iam::${this.account}:role/cdk-*`]
            })
          ]
        })
      }
    });
  }
}
