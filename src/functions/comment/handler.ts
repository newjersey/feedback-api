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
    // eslint-disable-next-line no-control-regex
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
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
