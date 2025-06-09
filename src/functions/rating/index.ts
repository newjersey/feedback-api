import {
  formatErrorResponse,
  ValidatedEventAPIGatewayProxyEvent
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { createFeedback, getAuthClient } from '@libs/google-sheets';
import { middyfy } from '@libs/lambda';
import { SSMClient } from '@aws-sdk/client-ssm';

import { getSsmParam } from '../../libs/awsUtils';

import schema from './schema';

const SSM = new SSMClient();

const rating: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { pageURL, rating } = event.body;

  try {
    const googleSheetsClientEmail = await getSsmParam(
      SSM,
      'feedback-api-sheets-email'
    );
    const googleSheetsPrivateKey = await getSsmParam(
      SSM,
      'feedback-api-sheets-private-key'
    );
    const sheetId = await getSsmParam(SSM, 'feedback-api-sheet-id');

    const client = await getAuthClient(
      googleSheetsClientEmail,
      googleSheetsPrivateKey
    );
    const feedbackId = await createFeedback(client, sheetId, pageURL, rating);

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

export const handler = middyfy(rating);
