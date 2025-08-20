import { formatFeedbackResponse } from '../shared/utils/responseUtils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  createFeedback,
  getAuthClient
} from '../shared/utils/googleSheetsUtils';
import { SSMClient } from '@aws-sdk/client-ssm';
import {
  Rating,
  FeedbackResponse,
  FeedbackResponseStatusCodes
} from '../shared/types';

import { getSsmParam } from '../shared/utils/awsUtils';

const SSM = new SSMClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<FeedbackResponse> => {
  try {
    const { pageURL, rating } = JSON.parse(event.body as string) as Rating;

    if (pageURL == null) {
      throw new Error('Submission is missing page URL');
    }
    if (rating == null) {
      throw new Error('Submission is missing rating value');
    }

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

    return formatFeedbackResponse(FeedbackResponseStatusCodes.Success, {
      message: 'Success',
      feedbackId: feedbackId
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'No further details';
    // eslint-disable-next-line no-console
    console.error(`Error: ${message}`);
    return formatFeedbackResponse(FeedbackResponseStatusCodes.Error, {
      message: `Failed to save rating: ${message}`
    });
  }
};
