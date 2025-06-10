import {
  formatErrorResponse,
  ValidatedEventAPIGatewayProxyEvent
} from 'src/utils/api-gateway';
import { formatJSONResponse } from 'src/utils/api-gateway';
import { Feedback, getAuthClient, updateFeedback } from 'src/utils/google-sheets';
import { SSMClient } from '@aws-sdk/client-ssm';

import { getSsmParam } from '../../utils/awsUtils';

import schema from './schema';

const SSM = new SSMClient();

export const handler: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const { email, feedbackId } = event.body;

  try {
    const googleSheetsClientEmail = await getSsmParam(
      SSM,
      'feedback-api/sheets-email'
    );
    const googleSheetsPrivateKey = await getSsmParam(
      SSM,
      'feedback-api/sheets-private-key'
    );
    const client = await getAuthClient(
      googleSheetsClientEmail,
      googleSheetsPrivateKey
    );

    const sheetId = await getSsmParam(SSM, 'feedback-api/sheet-id');

    const updatedId = await updateFeedback(
      client,
      sheetId,
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
