import type { AWS } from '@serverless/typescript';

import rating from '@functions/rating';
import comment from '@functions/comment';
import email from '@functions/email';

const serverlessConfiguration: AWS = {
  service: 'feedback-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      SHEET_ID: process.env.SHEET_ID,
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
      CLIENT_EMAIL: process.env.CLIENT_EMAIL
    }
  },
  // import the function via paths
  functions: { rating, comment, email },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
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
