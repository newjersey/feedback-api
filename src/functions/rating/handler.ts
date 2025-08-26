import {
  formatErrorResponse,
  ValidatedEventAPIGatewayProxyEvent
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { createFeedback, getAuthClient } from '@libs/google-sheets';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const rating: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { pageURL, rating } = event.body;

  try {
    const client = await getAuthClient();
    const feedbackId = await createFeedback(client, pageURL, rating);

    return formatJSONResponse({
      message: 'Success',
      feedbackId
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'No further details';
    // eslint-disable-next-line no-console
    console.error(`Error: ${message}`);
    return formatErrorResponse({
      message: `Failed to save rating: ${message}`
    });
  }
};

export const main = middyfy(rating);
