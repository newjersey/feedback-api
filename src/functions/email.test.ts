import { APIGatewayProxyEvent } from 'aws-lambda';
import { describe, expect, it, vi } from 'vitest';
import { FeedbackResponseStatusCodes } from '../shared/types';
import { handler } from './email';

const TEST_FEEDBACK_ID = 1;
const TEST_EMAIL = 'example@test.com';

vi.mock('../shared/utils/awsUtils', () => ({
  getSsmParam: vi.fn()
}));

vi.mock('../shared/utils/googleSheetsUtils', () => ({
  updateFeedback: vi.fn(),
  getAuthClient: vi.fn()
}));

describe('handler', () => {
  it('returns a success response when the email is saved successfully', async () => {
    const testEvent = {
      body: JSON.stringify({
        feedbackId: TEST_FEEDBACK_ID,
        email: TEST_EMAIL
      })
    } as APIGatewayProxyEvent;

    const response = await handler(testEvent);
    expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Success);
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });
});
