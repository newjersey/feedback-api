import * as googleSheetsUtils from '../shared/utils/googleSheetsUtils';
import * as awsUtils from '../shared/utils/awsUtils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './email';

const TEST_FEEDBACK_ID = 1;
const TEST_EMAIL = 'example@test.com';

describe('rating Lambda', () => {
  jest.spyOn(googleSheetsUtils, 'updateFeedback').mockImplementation(jest.fn());
  jest.spyOn(googleSheetsUtils, 'getAuthClient').mockImplementation(jest.fn());
  jest.spyOn(awsUtils, 'getSsmParam').mockImplementation(jest.fn());

  it("returns a response containing the 'Access-Control-Allow-Origin':'*' header to enable CORS", async () => {
    const testEvent = {
      body: JSON.stringify({
        feedbackId: TEST_FEEDBACK_ID,
        email: TEST_EMAIL
      })
    } as APIGatewayProxyEvent;

    const response = await handler(testEvent);
    expect(response.statusCode).toBe(200);
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });
});
