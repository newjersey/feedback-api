import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as ec2, aws_rds as rds } from 'aws-cdk-lib';

interface FeedbackDbStackProps extends cdk.StackProps {
  vpc?: ec2.IVpc; // allows for mocking in tests
}

export class FeedbackDbStack extends cdk.Stack {
  vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props: FeedbackDbStackProps) {
    super(scope, id, props);

    this.vpc =
      props.vpc ??
      ec2.Vpc.fromLookup(this, 'DevVpc', {
        vpcId: 'vpc-06ea0349e255c4c59'
      });

    const subnetGroup = new rds.SubnetGroup(this, 'FeedbackSubnetGroup', {
      description: 'Aurora DB private subnet group',
      vpc: this.vpc,
      subnetGroupName: 'feedback-subnet-group'
    });

    const cluster = new rds.DatabaseCluster(this, 'FeedbackDBCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_17_4
      }),
      backup: {
        retention: cdk.Duration.days(7)
      },
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      defaultDatabaseName: 'feedbackWidgetDb',
      serverlessV2MaxCapacity: 2,
      serverlessV2MinCapacity: 0.5,
      storageEncrypted: true,
      subnetGroup: subnetGroup,
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
      },
      writer: rds.ClusterInstance.serverlessV2('writer')
    });

    const proxy = cluster.addProxy('FeedbackProxy', {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      secrets: [cluster.secret!],
      vpc: this.vpc
    });

    new cdk.CfnOutput(this, 'FeedbackDBProxyEndpoint', {
      value: proxy.endpoint,
      description: 'Proxy endpoint to connect to'
    });
  }
}
