import { APIGatewayProxyEvent } from 'aws-lambda';
import { describe, expect, it, vi } from 'vitest';
import { FeedbackResponseStatusCodes } from '../shared/types';
import { handler } from './comment';

vi.mock('../shared/utils/awsUtils', () => ({
  getSsmParam: vi.fn()
}));

vi.mock('../shared/utils/pii-redaction', () => ({
  redactPii: vi.fn()
}));

vi.mock('../shared/utils/googleSheetsUtils', () => ({
  createFeedback: vi.fn(),
  updateFeedback: vi.fn(),
  getAuthClient: vi.fn()
}));

describe('handler', () => {
  it('returns a success response when the request body contains feedback ID and comment', async () => {
    const testEvent = {
      body: JSON.stringify({
        feedbackId: 1,
        comment: 'test comment'
      })
    } as APIGatewayProxyEvent;

    const response = await handler(testEvent);
    expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Success);
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  describe('expected 500 errors', () => {
    it('returns a 500 response when the request is missing the comment', async () => {
      const testEvent = {
        body: JSON.stringify({
          feedbackId: 1
        })
      } as APIGatewayProxyEvent;

      const response = await handler(testEvent);
      expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Error);
      expect(JSON.parse(response.body).message).toBe(
        'Failed to save comment: Submission is missing comment'
      );
    });

    it('returns a 500 response when the request is missing both the feedbackId and the pageURL', async () => {
      const testEvent = {
        body: JSON.stringify({
          rating: false,
          comment: 'test comment'
        })
      } as APIGatewayProxyEvent;

      const response = await handler(testEvent);
      expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Error);
      expect(JSON.parse(response.body).message).toBe(
        'Failed to save comment: If submission is missing feedbackId, then it must include pageURL and rating.'
      );
    });

    it('returns a 500 response when the request is missing both the feedbackId and the rating', async () => {
      const testEvent = {
        body: JSON.stringify({
          pageUrl: 'example.com',
          comment: 'test comment'
        })
      } as APIGatewayProxyEvent;

      const response = await handler(testEvent);
      expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Error);
      expect(JSON.parse(response.body).message).toBe(
        'Failed to save comment: If submission is missing feedbackId, then it must include pageURL and rating.'
      );
    });
  });
});
