import {
  formatErrorResponse,
  ValidatedEventAPIGatewayProxyEvent
} from 'src/utils/api-gateway';
import { formatJSONResponse } from 'src/utils/api-gateway';
import {
  createFeedback,
  Feedback,
  getAuthClient,
  updateFeedback
} from 'src/utils/google-sheets';
import { ComprehendClient } from '@aws-sdk/client-comprehend';
import { SSMClient } from '@aws-sdk/client-ssm';

import { getSsmParam } from '../../utils/awsUtils';

const COMPREHEND_CLIENT = new ComprehendClient({ region: 'us-east-1' });

import schema from './schema';
import { redactPii } from 'src/utils/pii-redaction';

const SSM = new SSMClient();

export const handler: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const { feedbackId, comment, pageURL, rating } = event.body;

  try {
    const redactedComment = await redactPii(comment.trim(), COMPREHEND_CLIENT);

    const googleSheetsClientEmail = await getSsmParam(
      SSM,
      'feedback-api/sheets-email'
    );
    const googleSheetsPrivateKey = await getSsmParam(
      SSM,
      'feedback-api/sheets-private-key'
    );
    const sheetId = await getSsmParam(SSM, 'feedback-api/sheet-id');

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
      return formatJSONResponse({
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
      return formatJSONResponse({
        message: 'Success',
        feedbackId: createdId
      });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'No further details';
    // eslint-disable-next-line no-console
    console.error(`Error: ${message}`);
    return formatErrorResponse({
      message: `Failed to save comment: ${message}`
    });
  }
};
