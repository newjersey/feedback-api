# Feedback Widget API

This project is for the REST API that handles interactions on the feedback widget UI and adds this data to a database, currently Google Sheets. It is deployed to AWS Lambda + API Gateway.

This project has been generated using the `aws-nodejs-typescript` template from the [Serverless framework](https://www.serverless.com/). For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/).

## Setup

1. Clone this repository
2. Create `.env` file in root directory, pasting in values from [Bitwarden secure note](https://vault.bitwarden.com/#/vault?collectionId=30a0c305-72f6-4e50-a403-b09a010f5467&itemId=65d29f31-d443-415d-b8b9-b10f017a41a5). Note that these values are production keys that will allow for live testing. We hope to create a dev or local stage in the future.
3. Run `npm install` (on Node 18, as listed in `.nvmrc`) to install Node dependencies
4. Run `npx sls offline` to start the API locally
5. In another terminal, try calling API endpoints such as the example below. Note that this will actually add data to our live production database (Google Sheets).

```bash
curl -d '{"pageURL":"www.test.com","rating":true}' -H "Content-Type: application/json" http://localhost:3000/rating
```

## Deployment

Deployment is done locally to the AWS account `Innov-RES-Dev` and _not_ yet connected to Github version control.

1. Make code changes locally
2. Test code changes locally
3. Log into AWS console, and open "Command line and programmatic access" option under `Innov-RES-Dev` account
4. Follow instructions in modal to save AWS credentials to `~/.aws/credentials` file
5. Run `npx sls deploy --aws-profile {INSERT PROFILE NAME HERE}` to deploy this Serverless project to AWS

## Installation/deployment instructions

## Test your service

This template contains a single lambda function triggered by an HTTP request made on the provisioned API Gateway REST API `/rating` route with `POST` method. The request body must be provided as `application/json`. The body structure is tested by API Gateway against `src/functions/rating/schema.ts` JSON-Schema definition: it must contain the `name` property.

- requesting any other path than `/rating` with any other method than `POST` will result in API Gateway returning a `403` HTTP error code
- sending a `POST` request to `/rating` with a payload **not** containing a string property named `name` will result in API Gateway returning a `400` HTTP error code
- sending a `POST` request to `/rating` with a payload containing a string property named `name` will result in API Gateway returning a `200` HTTP status code with a message saluting the provided name and the detailed event processed by the lambda

> :warning: As is, this template, once deployed, opens a **public** endpoint within your AWS account resources. Anybody with the URL can actively execute the API Gateway endpoint and the corresponding lambda. You should protect this endpoint with the authentication method of your choice.

### Locally

In order to test the rating function locally, run the following command:

- `npx sls invoke local -f rating --path src/functions/rating/mock.json` if you're using NPM
- `npx sls offline` to run the API locally on `https://localhost:3000`

Check the [sls invoke local command documentation](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/) for more information.

Note that to run locally, you need to export any environment variables used in code to your current environment. They can be found in the AWS Lambda configurations.

### Remotely

Copy and replace your `url` - found in Serverless `deploy` command output - and `name` parameter in the following `curl` command in your terminal or in Postman to test your newly deployed application.

```
curl --location --request POST 'https://endpoint.execute-api.region.amazonaws.com/dev/rating' \
--header 'Content-Type: application/json' \
--data-raw '{
    "pageURL": "example.com",
    "rating": true
}'
```

## Template features

### Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas

```
.
├── src
│   ├── functions               # Lambda configuration and source code folder
│   │   ├── rating
│   │   │   ├── handler.ts      # `rating` lambda source code
│   │   │   ├── index.ts        # `rating` lambda Serverless configuration
│   │   │   ├── mock.json       # `rating` lambda input parameter, if any, for local invocation
│   │   │   └── schema.ts       # `rating` lambda input event JSON-Schema
│   │   │
│   │   └── index.ts            # Import/export of all lambda configurations
│   │
│   └── libs                    # Lambda shared code
│       └── apiGateway.ts       # API Gateway specific helpers
│       └── handlerResolver.ts  # Sharable library for resolving lambda handlers
│       └── lambda.ts           # Lambda middleware
│
├── package.json
├── serverless.ts               # Serverless service file
├── tsconfig.json               # Typescript compiler configuration
├── tsconfig.paths.json         # Typescript paths
└── webpack.config.js           # Webpack configuration
```

This project also contains a `scripts` folder, which contains post-processing Python scripts that help analyze the feedback data.

### 3rd party libraries

- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts) - uses JSON-Schema definitions used by API Gateway for HTTP request validation to statically generate TypeScript types in your lambda's handler code base
- [middy](https://github.com/middyjs/middy) - middleware engine for Node.Js lambda. This template uses [http-json-body-parser](https://github.com/middyjs/middy/tree/master/packages/http-json-body-parser) to convert API Gateway `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object
- [@serverless/typescript](https://github.com/serverless/typescript) - provides up-to-date TypeScript definitions for your `serverless.ts` service file

### Advanced usage

Any tsconfig.json can be used, but if you do, set the environment variable `TS_NODE_CONFIG` for building the application, eg `TS_NODE_CONFIG=./tsconfig.app.json npx serverless webpack`
