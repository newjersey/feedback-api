import { FeedbackResponseStatusCodes, FeedbackResponse } from '../shared/types';

export const formatFeedbackResponse = (
  statusCode: FeedbackResponseStatusCodes,
  response: Record<string, unknown>
): FeedbackResponse => {
  const result: FeedbackResponse = {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(response)
  };

  return result;
};
