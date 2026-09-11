import * as googleSheetsUtils from '../shared/utils/googleSheetsUtils';
import * as awsUtils from '../shared/utils/awsUtils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './rating';
import { FeedbackResponseStatusCodes } from '../shared/types';
import { describe, it, expect, vi } from 'vitest';

const TEST_PAGE_URL = 'example.com';
const TEST_RATING = false;

describe('handler', () => {
  vi.spyOn(googleSheetsUtils, 'createFeedback').mockImplementation(vi.fn());
  vi.spyOn(googleSheetsUtils, 'getAuthClient').mockImplementation(vi.fn());
  vi.spyOn(awsUtils, 'getSsmParam').mockImplementation(vi.fn());

  it("returns a response containing the 'Access-Control-Allow-Origin':'*' header to enable CORS", async () => {
    const testEvent = {
      body: JSON.stringify({
        pageURL: TEST_PAGE_URL,
        rating: TEST_RATING
      })
    } as APIGatewayProxyEvent;

    const response = await handler(testEvent);
    expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Success);
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });
});
