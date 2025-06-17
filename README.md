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
2. Run `npm install` (on Node 22, as listed in `.nvmrc`) to install Node dependencies
3. Save the credentials from the `Innov-Platform-Dev` AWS account to your `~/.aws/credentials` file

## Deployment

Deployment to AWS is done locally on the command line and is _not_ yet connected to Github version control.

The code can be deployed to either the dev account (`Innov-Platform-Dev`) or to the prod account (`Innov-Platform-Prod`). **Please be careful to deploy to the prod account only with extreme caution and after thoroughly testing changes in dev.**

1. Make code changes locally
2. Test code changes locally
3. Log into AWS console, and open "Command line and programmatic access" option under the appropriate account
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

### In dev

In order to test functions, you can run the following mock requests from the "Testing" tab in the Lambda console for the appropriate function. Update the body of the request as needed to test different scenarios. **Please note that all requests will write directly to the Prod Google Sheet for the time being. After running requests, be sure to remove any changes from the spreadsheet.**

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

Note that to run locally, you need to export any environment variables used in code to your current environment. They can be found in the AWS Lambda configurations.

#### Running the local dev database
##### Installation
1. Install [colima](https://github.com/abiosoft/colima) with `brew install colima`
2. Install docker with `brew install docker`
3. Install docker-compose with `brew install docker-compose`
    - This will give the message (also in [Homebrew docs](https://formulae.brew.sh/formula/docker-compose)): 
        > ==> Caveats   
        > Compose is a Docker plugin. For Docker to find the plugin, add "cliPluginsExtraDirs" to ~/.docker/config.json:
        >
        > ```
        >"cliPluginsExtraDirs": [
        >    "/opt/homebrew/lib/docker/cli-plugins"
        > ]
        >```
        Make sure to follow these instructions or you won't able to run commands using `docker compose` (you will have to use `docker-compose` instead)

##### Starting the Docker container
4. Run `colima start` to start the Docker runtime
    - If it prompts you to, run `brew install lima-additional-guestagents` (this is because there was a recent split in the package, see [GitHub issue #1333](https://github.com/abiosoft/colima/issues/1333) for more detail)
5. Run `docker-compose up -d` from the project root.
    - The `-d` flag indicated detached mode, which runs the container in the background (so it won't be attached to your terminal)
6. The database should now be running at the connection string `postgresql://postgres:postgres@localhost:5432/postgres`
    - You can test this by checking that you can connect to the database via psql without erroring: 
        ```bash
        psql postgresql://postgres:postgres@localhost:5432/postgres
        ```
        
##### Clean up
7. To stop the docker container, run `docker compose down` from the project root.
8. When you’re done developing, run `colima stop` to stop the Docker runtime
    - Remember to run `colima start` in the future whenever you want to use Docker Compose

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

## Technical diagram

Below is the latest technical architecture as of November 2024. To update the file, download the `docs/Feedback-Widget-Diagram.excalidraw` file, import it on [Excalidraw](https://excalidraw.com/), edit the diagram, and update the corresponding files in this repository with the latest versions.

![Feedback widget technical diagram](docs/Feedback-Widget-Diagram.png)
