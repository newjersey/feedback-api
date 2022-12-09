import {
  formatErrorResponse,
  ValidatedEventAPIGatewayProxyEvent
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { Feedback, getAuthClient, updateFeedback } from '@libs/google-sheets';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const comment: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { feedbackId, comment } = event.body;

  try {
    const client = await getAuthClient();
    const updatedId = await updateFeedback(
      client,
      feedbackId,
      Feedback.Comment,
      comment
    );
    return formatJSONResponse({
      message: 'Success',
      feedbackId: updatedId
    });
  } catch (e) {
    return formatErrorResponse({ message: 'Error - Unknown' });
  }
};

export const main = middyfy(comment);
