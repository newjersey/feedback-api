import * as googleSheetsUtils from '../shared/utils/googleSheetsUtils';
import * as awsUtils from '../shared/utils/awsUtils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './rating';

const TEST_PAGE_URL = 'example.com';
const TEST_RATING = false;

describe('rating Lambda', () => {
  jest.spyOn(googleSheetsUtils, 'createFeedback').mockImplementation(jest.fn());
  jest.spyOn(googleSheetsUtils, 'getAuthClient').mockImplementation(jest.fn());
  jest.spyOn(awsUtils, 'getSsmParam').mockImplementation(jest.fn());

  it('returns a 200 success response when request contains a pageURL and rating', async () => {
    const testEvent = {
      body: JSON.stringify({
        pageURL: TEST_PAGE_URL,
        rating: TEST_RATING
      })
    } as APIGatewayProxyEvent;

    const response = await handler(testEvent);
    expect(response.statusCode).toBe(200);
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });
});
