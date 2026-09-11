import { APIGatewayProxyEvent } from 'aws-lambda';
import { describe, expect, it, vi } from 'vitest';
import { FeedbackResponseStatusCodes } from '../shared/types';
import { handler } from './rating';

const TEST_PAGE_URL = 'example.com';
const TEST_RATING = false;

vi.mock('../shared/utils/awsUtils', () => ({
  getSsmParam: vi.fn()
}));

vi.mock('../shared/utils/googleSheetsUtils', () => ({
  createFeedback: vi.fn(),
  getAuthClient: vi.fn()
}));

describe('handler', () => {
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
