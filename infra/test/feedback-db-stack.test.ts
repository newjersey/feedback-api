import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as Cdk from '../lib/feedback-db-stack';
import { Template } from 'aws-cdk-lib/assertions';

describe('FeedbackDBStack', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let feedbackDbStack: Cdk.FeedbackDbStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();

    const fakeEnv = {
      account: '123456789012',
      region: 'us-east-1'
    };

    stack = new cdk.Stack(app, 'TestStack', {
      env: fakeEnv
    });

    const mockedVpc = ec2.Vpc.fromVpcAttributes(stack, 'MockedVpc', {
      vpcId: 'vpc-123456789',
      availabilityZones: ['us-east-1a', 'us-east-1b'],
      privateSubnetIds: ['subnet-1234', 'subnet-5678']
    });

    feedbackDbStack = new Cdk.FeedbackDbStack(app, 'FeedbackDbStack', {
      vpc: mockedVpc,
      env: fakeEnv
    });

    template = Template.fromStack(feedbackDbStack);
  });

  it('creates a subnet group', () => {
    template.resourceCountIs('AWS::RDS::DBSubnetGroup', 1);
    template.hasResourceProperties('AWS::RDS::DBSubnetGroup', {
      DBSubnetGroupDescription: 'Aurora DB private subnet group'
    });
  });

  it('creates an Aurora DB cluster', () => {
    template.hasResourceProperties('AWS::RDS::DBCluster', {
      Engine: 'aurora-postgresql',
      DatabaseName: 'feedbackWidgetDb',
      StorageEncrypted: true,
      ServerlessV2ScalingConfiguration: {
        MinCapacity: 0.5,
        MaxCapacity: 2
      }
    });
  });
});
