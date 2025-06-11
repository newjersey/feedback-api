# Feedback Widget API

## Architecture

This project is for the REST API that handles interactions on the feedback widget UI and adds this data to a database, currently Google Sheets. It is deployed to AWS Lambda + API Gateway. For full architecture of feedback system, see "Technical diagram" section below.

## Endpoints

For the latest information on the API endpoints maintained, see the functions imported and configured within the `feedback-api-stack.ts` file. Within the `src/functions/` folder, each file corresponds to an API endpoint. For example, see `src/functions/comment.ts` for details on the `POST /comment` endpoint. For a quick summary, this repo supports the following endpoints:

- `POST /rating` - saves Yes/No rating to database
- `POST /comment`- saves text comment to database (and cleans PII)
- `POST /email` - saves email to database

## Setup

1. Clone this repository
2. Run `npm install` (on Node 20, as listed in `.nvmrc`) to install Node dependencies
3. Save the credentials from the `Innov-Platform-dev` AWS account to your `~/.aws/credentials` file
4. Run the API locally
5. In another terminal window, you can test sending commands like the following:

```bash
curl -d '{"pageURL":"www.test.com","rating":true}' -H "Content-Type: application/json" http://localhost:3000/rating
```

## Deployment

Deployment is done locally to the AWS account `Innov-Platform-dev` and _not_ yet connected to Github version control.

1. Make code changes locally
2. Test code changes locally
3. Log into AWS console, and open "Command line and programmatic access" option under `Innov-Platform-Dev` account
4. Save the account credentials to your `~/.aws/credentials` file.
5. Run `export AWS_PROFILE=[PROFILE ID]` from your command line
6. Navigate to the `/infra` directory
7. Run `npx cdk deploy` to deploy this AWS CDK project to AWS

## Test your service

This template contains a single lambda function triggered by an HTTP request made on the provisioned API Gateway REST API `/rating` route with `POST` method. The request body must be provided as `application/json`. The body structure is tested by API Gateway against `src/functions/rating/schema.ts` JSON-Schema definition: it must contain the `name` property.

- requesting any other path than `/rating` with any other method than `POST` will result in API Gateway returning a `403` HTTP error code
- sending a `POST` request to `/rating` with a payload **not** containing a string property named `name` will result in API Gateway returning a `400` HTTP error code
- sending a `POST` request to `/rating` with a payload containing a string property named `name` will result in API Gateway returning a `200` HTTP status code with a message saluting the provided name and the detailed event processed by the lambda

> :warning: As is, this template, once deployed, opens a **public** endpoint within your AWS account resources. Anybody with the URL can actively execute the API Gateway endpoint and the corresponding lambda. You should protect this endpoint with the authentication method of your choice.

### Locally

In order to test functions run the following mock requests:

#### Rating
```
{
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"pageURL\":\"example.com\",\"rating\":\"true\"}"
}
```

#### Email
```
{
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"email\":\"hi@example.com\",\"feedbackId\":\"2\"}"
}
```

#### Comment
```
{
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"feedbackId\":\"1\",\"comment\":\"good\"}"
}
```


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

### 3rd party libraries

- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts) - uses JSON-Schema definitions used by API Gateway for HTTP request validation to statically generate TypeScript types in your lambda's handler code base
- [middy](https://github.com/middyjs/middy) - middleware engine for Node.Js lambda. This template uses [http-json-body-parser](https://github.com/middyjs/middy/tree/master/packages/http-json-body-parser) to convert API Gateway `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object
- [@serverless/typescript](https://github.com/serverless/typescript) - provides up-to-date TypeScript definitions for your `serverless.ts` service file

### Advanced usage

Any tsconfig.json can be used, but if you do, set the environment variable `TS_NODE_CONFIG` for building the application, eg `TS_NODE_CONFIG=./tsconfig.app.json npx serverless webpack`

## Technical diagram

Below is the latest technical architecture as of November 2024. To update the file, download the `docs/Feedback-Widget-Diagram.excalidraw` file, import it on [Excalidraw](https://excalidraw.com/), edit the diagram, and update the corresponding files in this repository with the latest versions.

![Feedback widget technical diagram](docs/Feedback-Widget-Diagram.png)
