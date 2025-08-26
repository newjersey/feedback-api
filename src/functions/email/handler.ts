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
    const message = e instanceof Error ? e.message : 'No further details';
    // eslint-disable-next-line no-console
    console.error(`Error: ${message}`);
    return formatErrorResponse({
      message: `Failed to save email: ${message}`
    });
  }
};

export const main = middyfy(email);
