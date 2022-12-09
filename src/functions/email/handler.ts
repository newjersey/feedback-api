import {
  formatErrorResponse,
  ValidatedEventAPIGatewayProxyEvent
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { Feedback, getAuthClient, updateFeedback } from '@libs/google-sheets';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const email: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { email, feedbackId } = event.body;

  try {
    const client = await getAuthClient();
    const updatedId = await updateFeedback(
      client,
      feedbackId,
      Feedback.Email,
      email
    );
    return formatJSONResponse({
      message: 'Success',
      feedbackId: updatedId
    });
  } catch (e) {
    return formatErrorResponse({ message: 'Error - Unknown' });
  }
};

export const main = middyfy(email);
