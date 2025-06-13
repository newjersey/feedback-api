import {
  FeedbackBody,
  FeedbackResponseStatusCodes,
  FeedbackResponse
} from '../types';

export const formatFeedbackResponse = (
  statusCode: FeedbackResponseStatusCodes,
  response: FeedbackBody
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
