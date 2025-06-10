const serverlessConfiguration = {
  service: 'feedback-api',
  frameworkVersion: '4',
  plugins: ['serverless-offline'],
  provider: {
    name: 'aws',
    stage: 'dev',
    runtime: 'nodejs18.x',
    timeout: 30,
    deploymentBucket: {
      serverSideEncryption: 'AES256'
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      SHEET_ID: '${ssm:feedback-api-sheet-id}',
      GOOGLE_PRIVATE_KEY: '${ssm:feedback-api-sheets-private-key}',
      CLIENT_EMAIL: '${ssm:feedback-api-sheets-email}'
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['comprehend:DetectPiiEntities'],
            Resource: '*'
          }
        ]
      }
    }
  },
  // import the function via paths
  functions: {},
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10
    },
    'serverless-offline': {
      noPrependStageInUrl: true
    }
  }
};

module.exports = serverlessConfiguration;
