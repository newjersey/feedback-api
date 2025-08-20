# Feedback Widget Infrastructure (AWS CDK - TypeScript)

This project defines the infrastructure for the **Feedback Widget** using [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html) with TypeScript. It provisions an **Aurora PostgreSQL Serverless v2** database (DB) along with its supporting resources.

## Resources

| Resource              | Logical ID           | Purpose |
|-----------------------|----------------------|---------|
| **VPC**               | `FeedbackVpc`          | Isolated network environment for the DB |
| **Subnet Group**      | `FeedbackSubnetGroup`  | Specifies DB placement in private subnets |
| **Aurora Cluster**    | `FeedbackDBCluster`      | Serverless v2 Aurora PostgreSQL DB |
| **Outputs**           | `FeedbackDBClusterEndpoint` | Cluster endpoint for local development or reference |

## CDK Setup & Commands

To get started or continue working:

```bash
npm install                 # Install dependencies
npm run diff                # Preview infrastructure changes
npm run deploy              # Deploy to AWS
npm run deploy:api          # Deploy the API to AWS
npm run deploy:db:dev       # Deploy the database to AWS (currently references the VPC in the dev account)
npm run synth:api           # Synthesizes the API stack into a CloudFormation template
npm run synth-db:dev        # Synthesizes the DB stack into a CloudFormation template
