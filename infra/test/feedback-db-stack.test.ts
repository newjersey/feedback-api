import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as Cdk from '../lib/feedback-db-stack';
import { Template } from 'aws-cdk-lib/assertions';
import {
  DEPLOYMENT_CONFIGS,
  ServerlessV2Capacity
} from '../lib/deployment-config';

type MockedEnvironment = 'dev' | 'prod';

const TEST_CAPACITY: Record<MockedEnvironment, ServerlessV2Capacity> = {
  dev: { minCapacity: 0, maxCapacity: 2 },
  prod: { minCapacity: 0.5, maxCapacity: 2 }
};

const testVpcIds: Record<MockedEnvironment, string> = {
  dev: 'vpc-123456789',
  prod: 'vpc-987654321'
};

describe('FeedbackDBStack', () => {
  it.each<MockedEnvironment>(['dev', 'prod'])(
    'creates an Aurora DB cluster for %s environment',
    (env) => {
      const app = new cdk.App();

      const fakeEnv = {
        account: '123456789012',
        region: 'us-east-1'
      };

      const stack = new cdk.Stack(app, `${env}-TestStack`, {
        env: fakeEnv
      });

      const mockedVpc = ec2.Vpc.fromVpcAttributes(stack, 'MockedVpc', {
        vpcId: testVpcIds[env],
        availabilityZones: ['us-east-1a', 'us-east-1b'],
        privateSubnetIds: ['subnet-1234', 'subnet-5678']
      });

      const feedbackDbStack = new Cdk.FeedbackDbStack(
        app,
        `${env}-FeedbackDbStack`,
        {
          vpc: mockedVpc,
          env: fakeEnv,
          vpcId: mockedVpc.vpcId,
          serverlessV2Capacity: {
            minCapacity: TEST_CAPACITY[env].minCapacity,
            maxCapacity: TEST_CAPACITY[env].maxCapacity
          }
        }
      );

      const template = Template.fromStack(feedbackDbStack);
      template.resourceCountIs('AWS::RDS::DBSubnetGroup', 1);
      template.hasResourceProperties('AWS::RDS::DBSubnetGroup', {
        DBSubnetGroupDescription: 'Aurora DB private subnet group'
      });
      template.hasResourceProperties('AWS::RDS::DBCluster', {
        Engine: 'aurora-postgresql',
        DatabaseName: 'feedbackWidgetDb',
        StorageEncrypted: true,
        ServerlessV2ScalingConfiguration: {
          MinCapacity: DEPLOYMENT_CONFIGS[env].serverlessV2Capacity.minCapacity,
          MaxCapacity: DEPLOYMENT_CONFIGS[env].serverlessV2Capacity.maxCapacity
        }
      });
    }
  );
});
