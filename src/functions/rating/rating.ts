import {
  formatErrorResponse,
  ValidatedEventAPIGatewayProxyEvent
} from 'src/utils/api-gateway';
import { formatJSONResponse } from 'src/utils/api-gateway';
import { createFeedback, getAuthClient } from 'src/utils/google-sheets';
import { SSMClient } from '@aws-sdk/client-ssm';
import { RatingEvent } from 'src/types';

import { getSsmParam } from '../../utils/awsUtils';

import schema from './schema';

const SSM = new SSMClient();

export const handler: ValidatedEventAPIGatewayProxyEvent<RatingEvent> = async (
  event
) => {
  const { pageURL, rating } = event.body;

  try {
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
