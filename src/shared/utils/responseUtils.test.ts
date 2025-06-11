import { formatFeedbackResponse } from './responseUtils';
import { FeedbackResponseStatusCodes } from '../types';

describe('formatFeedbackResponse', () => {
  it('should return a formatted response including the given status code and response body', () => {
    const statusCode = FeedbackResponseStatusCodes.Success;
    const response = { message: 'Success' };

    const formattedResponse = formatFeedbackResponse(statusCode, response);

    expect(formattedResponse.statusCode).toEqual(statusCode);
    expect(formattedResponse.body).toEqual(JSON.stringify(response));
  });
});
