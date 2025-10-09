export type EnvironmentName = 'dev' | 'prod';

export interface ServerlessV2Capacity {
  minCapacity: number;
  maxCapacity: number;
}

interface DeploymentConfig {
  accountId: string;
  region: string;
  vpcId: string;
  serverlessV2Capacity: ServerlessV2Capacity;
}

export const DEPLOYMENT_CONFIGS: Record<EnvironmentName, DeploymentConfig> = {
  dev: {
    accountId: '152320432929',
    region: 'us-east-1',
    vpcId: 'vpc-06ea0349e255c4c59',
    serverlessV2Capacity: {
      minCapacity: 0,
      maxCapacity: 2
    }
  },
  prod: {
    accountId: '302743383333',
    region: 'us-east-1',
    vpcId: 'vpc-051d43046b343c516',
    serverlessV2Capacity: {
      minCapacity: 0.5,
      maxCapacity: 2
    }
  }
};
