import { APIGatewayProxyEvent } from 'aws-lambda';
import { getSsmParam } from 'src/shared/utils/awsUtils';
import {
  createFeedback,
  getAuthClient,
  updateFeedback
} from 'src/shared/utils/googleSheetsUtils';
import { redactPii } from 'src/shared/utils/pii-redaction';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const validTestEventWithFeedbackId = {
    body: JSON.stringify({
      feedbackId: 1,
      comment: 'test comment'
    })
  } as APIGatewayProxyEvent;

  const validTestEventWithoutFeedbackId = {
    body: JSON.stringify({
      pageURL: 'testUrl',
      rating: 'test rating',
      comment: 'test comment'
    })
  } as APIGatewayProxyEvent;

  it('returns a success response when the request body contains feedback ID and comment', async () => {
    const response = await handler(validTestEventWithFeedbackId);

    expect(redactPii).toHaveBeenCalledOnce();
    expect(getSsmParam).toHaveBeenCalledTimes(3);
    expect(getAuthClient).toHaveBeenCalledOnce();
    expect(updateFeedback).toHaveBeenCalledOnce();

    expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Success);
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('returns a success response when the request body contains pageURL, comment, and rating but not the feedback ID', async () => {
    const response = await handler(validTestEventWithoutFeedbackId);

    expect(redactPii).toHaveBeenCalledOnce();
    expect(getSsmParam).toHaveBeenCalledTimes(3);
    expect(getAuthClient).toHaveBeenCalledOnce();
    expect(createFeedback).toHaveBeenCalledOnce();

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

      expect(redactPii).not.toHaveBeenCalled();
      expect(getSsmParam).not.toHaveBeenCalled();
      expect(getAuthClient).not.toHaveBeenCalled();
      expect(updateFeedback).not.toHaveBeenCalled();

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

      expect(redactPii).toHaveBeenCalledOnce();
      expect(getSsmParam).toHaveBeenCalledTimes(3);
      expect(getAuthClient).toHaveBeenCalledOnce();
      expect(updateFeedback).not.toHaveBeenCalled();
      expect(createFeedback).not.toHaveBeenCalled();

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

      expect(redactPii).toHaveBeenCalledOnce();
      expect(getSsmParam).toHaveBeenCalledTimes(3);
      expect(getAuthClient).toHaveBeenCalledOnce();
      expect(updateFeedback).not.toHaveBeenCalled();
      expect(createFeedback).not.toHaveBeenCalled();

      expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Error);
      expect(JSON.parse(response.body).message).toBe(
        'Failed to save comment: If submission is missing feedbackId, then it must include pageURL and rating.'
      );
    });

    it('returns a 500 response when an error is thrown by the redactPii function', async () => {
      vi.mocked(redactPii).mockThrow('Error!');

      const response = await handler(validTestEventWithFeedbackId);

      expect(redactPii).toHaveBeenCalledOnce();
      expect(getSsmParam).not.toHaveBeenCalled();
      expect(getAuthClient).not.toHaveBeenCalled();
      expect(updateFeedback).not.toHaveBeenCalled();

      expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Error);

      expect(JSON.parse(response.body).message).toContain(
        'Failed to save comment'
      );
    });

    it('returns a 500 response when an error is thrown getting the Google Sheets client email from SSM', async () => {
      vi.mocked(getSsmParam).mockThrow('Error!');

      const response = await handler(validTestEventWithFeedbackId);

      expect(redactPii).toHaveBeenCalledOnce();
      expect(getSsmParam).toHaveBeenCalledTimes(1);
      expect(getAuthClient).not.toHaveBeenCalled();
      expect(updateFeedback).not.toHaveBeenCalled();

      expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Error);

      expect(JSON.parse(response.body).message).toContain(
        'Failed to save comment'
      );
    });

    it('returns a 500 response when an error is thrown getting the Google Sheets private key from SSM', async () => {
      vi.mocked(getSsmParam)
        .mockResolvedValueOnce('good param value')
        .mockThrow('Error!');

      const response = await handler(validTestEventWithFeedbackId);

      expect(redactPii).toHaveBeenCalledOnce();
      expect(getSsmParam).toHaveBeenCalledTimes(2);
      expect(getAuthClient).not.toHaveBeenCalled();
      expect(updateFeedback).not.toHaveBeenCalled();

      expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Error);

      expect(JSON.parse(response.body).message).toContain(
        'Failed to save comment'
      );
    });

    it('returns a 500 response when there is an error getting the Google Sheets sheet ID from SSM', async () => {
      vi.mocked(getSsmParam)
        .mockResolvedValueOnce('good param value')
        .mockResolvedValueOnce('good param value')
        .mockThrow('Error!');

      const response = await handler(validTestEventWithFeedbackId);

      expect(redactPii).toHaveBeenCalledOnce();
      expect(getSsmParam).toHaveBeenCalledTimes(3);
      expect(getAuthClient).not.toHaveBeenCalled();
      expect(updateFeedback).not.toHaveBeenCalled();

      expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Error);

      expect(JSON.parse(response.body).message).toContain(
        'Failed to save comment'
      );
    });

    it('returns an error when an error is thrown by the getAuthClient function', async () => {
      vi.mocked(getAuthClient).mockThrow('Error!');

      const response = await handler(validTestEventWithFeedbackId);

      expect(redactPii).toHaveBeenCalledOnce();
      expect(getSsmParam).toHaveBeenCalledTimes(3);
      expect(getAuthClient).toHaveBeenCalledOnce();
      expect(updateFeedback).not.toHaveBeenCalled();

      expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Error);

      expect(JSON.parse(response.body).message).toContain(
        'Failed to save comment'
      );
    });

    it('returns an error when an error is thrown by the updateFeedback function', async () => {
      vi.mocked(updateFeedback).mockThrow('Error!');

      const response = await handler(validTestEventWithFeedbackId);

      expect(redactPii).toHaveBeenCalledOnce();
      expect(getSsmParam).toHaveBeenCalledTimes(3);
      expect(getAuthClient).toHaveBeenCalledOnce();
      expect(updateFeedback).toHaveBeenCalledOnce();

      expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Error);

      expect(JSON.parse(response.body).message).toContain(
        'Failed to save comment'
      );
    });

    it('returns an error when an error is thrown by the create feedback function', async () => {
      vi.mocked(createFeedback).mockThrow('Error!');

      const response = await handler(validTestEventWithoutFeedbackId);

      expect(redactPii).toHaveBeenCalledOnce();
      expect(getSsmParam).toHaveBeenCalledTimes(3);
      expect(getAuthClient).toHaveBeenCalledOnce();
      expect(createFeedback).toHaveBeenCalledOnce();

      expect(response.statusCode).toBe(FeedbackResponseStatusCodes.Error);

      expect(JSON.parse(response.body).message).toContain(
        'Failed to save comment'
      );
    });
  });
});
