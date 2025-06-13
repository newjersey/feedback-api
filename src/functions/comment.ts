import { formatFeedbackResponse } from '../shared/utils/responseUtils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  createFeedback,
  getAuthClient,
  updateFeedback
} from '../shared/utils/googleSheetsUtils';
import { ComprehendClient } from '@aws-sdk/client-comprehend';
import { SSMClient } from '@aws-sdk/client-ssm';
import {
  Comment,
  Feedback,
  FeedbackResponse,
  FeedbackResponseStatusCodes
} from '../shared/types';

import { getSsmParam } from '../shared/utils/awsUtils';

const COMPREHEND_CLIENT = new ComprehendClient({ region: 'us-east-1' });

import { redactPii } from '../shared/utils/pii-redaction';

const SSM = new SSMClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<FeedbackResponse> => {
  try {
    const { feedbackId, comment, pageURL, rating } = JSON.parse(
      event.body
    ) as Comment;

    if (comment == null) {
      throw new Error('Submission is missing comment');
    }

    const redactedComment = await redactPii(comment.trim(), COMPREHEND_CLIENT);

    const googleSheetsClientEmail = await getSsmParam(
      SSM,
      '/feedback-api/sheets-email'
    );
    const googleSheetsPrivateKey = await getSsmParam(
      SSM,
      '/feedback-api/sheets-private-key'
    );
    const sheetId = await getSsmParam(SSM, '/feedback-api/sheet-id');

    const client = await getAuthClient(
      googleSheetsClientEmail,
      googleSheetsPrivateKey
    );

    if (feedbackId != null) {
      const updatedId = await updateFeedback(
        client,
        sheetId,
        feedbackId,
        Feedback.Comment,
        redactedComment
      );
      return formatFeedbackResponse(FeedbackResponseStatusCodes.Success, {
        message: 'Success',
        feedbackId: updatedId
      });
    } else if (pageURL != null && rating != null) {
      const createdId = await createFeedback(
        client,
        sheetId,
        pageURL,
        rating,
        redactedComment
      );
      return formatFeedbackResponse(FeedbackResponseStatusCodes.Success, {
        message: 'Success',
        feedbackId: createdId
      });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'No further details';
    // eslint-disable-next-line no-console
    console.error(`Error: ${message}`);
    return formatFeedbackResponse(FeedbackResponseStatusCodes.Error, {
      message: `Failed to save comment: ${message}`
    });
  }
};
