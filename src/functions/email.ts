import { formatFeedbackResponse } from '../shared/utils/responseUtils';

import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  Feedback,
  getAuthClient,
  updateFeedback
} from '../shared/utils/googleSheetsUtils';
import { SSMClient } from '@aws-sdk/client-ssm';
import {
  Email,
  FeedbackResponseStatusCodes,
  FeedbackResponse
} from '../shared/types';

import { getSsmParam } from '../shared/utils/awsUtils';

const SSM = new SSMClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<FeedbackResponse> => {
  const { email, feedbackId } = JSON.parse(event.body) as Email;

  try {
    const googleSheetsClientEmail = await getSsmParam(
      SSM,
      '/feedback-api/sheets-email'
    );
    const googleSheetsPrivateKey = await getSsmParam(
      SSM,
      '/feedback-api/sheets-private-key'
    );
    const client = await getAuthClient(
      googleSheetsClientEmail,
      googleSheetsPrivateKey
    );

    const sheetId = await getSsmParam(SSM, '/feedback-api/sheet-id');

    const updatedId = await updateFeedback(
      client,
      sheetId,
      feedbackId,
      Feedback.Email,
      email
    );
    return formatFeedbackResponse(FeedbackResponseStatusCodes.Success, {
      message: 'Success',
      feedbackId: updatedId
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'No further details';
    // eslint-disable-next-line no-console
    console.error(`Error: ${message}`);
    return formatFeedbackResponse(FeedbackResponseStatusCodes.Error, {
      message: `Failed to save email: ${message}`
    });
  }
};
