import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './comment';
import * as piiRedaction from '../shared/utils/pii-redaction';
import * as awsUtils from '../shared/utils/awsUtils';
import * as googleSheetsUtils from '../shared/utils/googleSheetsUtils';

describe('comment Lambda', () => {
  jest.spyOn(awsUtils, 'getSsmParam').mockImplementation(jest.fn());
  jest.spyOn(piiRedaction, 'redactPii').mockImplementation(jest.fn());
  jest.spyOn(googleSheetsUtils, 'createFeedback').mockImplementation(jest.fn());
  jest.spyOn(googleSheetsUtils, 'updateFeedback').mockImplementation(jest.fn());
  jest.spyOn(googleSheetsUtils, 'getAuthClient').mockImplementation(jest.fn());

  beforeEach(() => jest.resetAllMocks());

  it("returns a response containing the 'Access-Control-Allow-Origin':'*' header to enable CORS", async () => {
    const testEvent = {
      body: JSON.stringify({
        feedbackId: 1,
        comment: 'test comment'
      })
    } as APIGatewayProxyEvent;

    const response = await handler(testEvent);
    expect(response.statusCode).toBe(200);
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  describe('expected 500 errors', () => {
    beforeAll(() => jest.spyOn(console, 'error').mockImplementation(jest.fn()));
    afterAll(() => jest.spyOn(console, 'error').mockRestore());

    it('returns a 500 response when the request is missing the comment', async () => {
      const testEvent = {
        body: JSON.stringify({
          feedbackId: 1
        })
      } as APIGatewayProxyEvent;

      const response = await handler(testEvent);
      expect(response.statusCode).toBe(500);
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
      expect(response.statusCode).toBe(500);
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
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).message).toBe(
        'Failed to save comment: If submission is missing feedbackId, then it must include pageURL and rating.'
      );
    });
  });
});
