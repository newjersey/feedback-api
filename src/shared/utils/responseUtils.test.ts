import { formatFeedbackResponse } from './responseUtils';
import { FeedbackResponseStatusCodes } from '../shared/types';

describe('formatFeedbackResponse', () => {
  it('should return a formatted response including the given status code and response body', () => {
    const statusCode = FeedbackResponseStatusCodes.Success;
    const response = { message: 'Success' };

    const formattedResponse = formatFeedbackResponse(statusCode, response);

    expect(formattedResponse).toContain(JSON.stringify(statusCode));
    expect(formattedResponse).toContain(JSON.stringify(response));
  });
});
