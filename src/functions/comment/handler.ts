import {
  formatErrorResponse,
  ValidatedEventAPIGatewayProxyEvent
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import {
  createFeedback,
  Feedback,
  getAuthClient,
  updateFeedback
} from '@libs/google-sheets';
import { middyfy } from '@libs/lambda';
import { ComprehendClient } from '@aws-sdk/client-comprehend';

const COMPREHEND_CLIENT = new ComprehendClient({ region: 'us-east-1' });

import schema from './schema';
import { redactPii } from '@libs/pii-redaction';

const comment: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { feedbackId, comment, pageURL, rating } = event.body;

  try {
    const redactedComment = await redactPii(comment, COMPREHEND_CLIENT);

    const client = await getAuthClient();
    if (feedbackId != null) {
      const updatedId = await updateFeedback(
        client,
        feedbackId,
        Feedback.Comment,
        redactedComment
      );
      return formatJSONResponse({
        message: 'Success',
        feedbackId: updatedId
      });
    } else if (pageURL != null && rating != null) {
      const createdId = await createFeedback(
        client,
        pageURL,
        rating,
        redactedComment
      );
      return formatJSONResponse({
        message: 'Success',
        feedbackId: createdId
      });
    }
  } catch (e) {
    return formatErrorResponse({ message: 'Error - Unknown' });
  }
};

export const main = middyfy(comment);
