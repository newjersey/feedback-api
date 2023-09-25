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

import schema from './schema';

const comment: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { feedbackId, comment, pageURL, rating } = event.body;

  let redactedComment = comment.replace(/[0-9]/g, '*');
  redactedComment = redactedComment.replace(
    /([^.@\s]+)(\.[^.@\s]+)*@([^.@\s]+\.)+([^.@\s]+)/,
    '[EMAIL]'
  );

  try {
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
