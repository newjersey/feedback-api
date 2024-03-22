import {
  formatErrorResponse,
  ValidatedEventAPIGatewayProxyEvent
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import {
  getAuthClient,
  getLastNIterative,
  SHEET_CONFIGS
} from '@libs/google-sheets';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { getSummary } from '@libs/chat-gpt';

const INPUT_SIZE_FREQUENT = 1000;
const INPUT_SIZE_SPARSE = INPUT_SIZE_FREQUENT * 5;
const summary: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { pageURL } = event.body;
  const sheet =
    event.body.sheet === 'pflSheet' ? event.body.sheet : 'feedbackWidget';
  const dataReach = pageURL.includes('uistatus')
    ? INPUT_SIZE_FREQUENT
    : INPUT_SIZE_SPARSE;
  try {
    const client = await getAuthClient();
    const { url, comments } = await getLastNIterative(
      client,
      dataReach,
      pageURL,
      sheet
    );
    const filteredData = comments.filter(
      (v) =>
        v[SHEET_CONFIGS[sheet].columnOrder.PageURL].includes(url) &&
        v[SHEET_CONFIGS[sheet].columnOrder.Comment]
    );
    if (filteredData.length === 0) {
      return formatJSONResponse({
        message: 'No data found',
        dataSize: 0
      });
    }
    const cleanedComments = filteredData.map((v) =>
      v[SHEET_CONFIGS[sheet].columnOrder.Comment].trim()
    );
    const dataSummary = await getSummary(cleanedComments, pageURL);
    return formatJSONResponse({
      message: 'Success',
      dataSummary,
      dataSize: filteredData.length,
      dataStart: filteredData[0][SHEET_CONFIGS[sheet].columnOrder.Timestamp],
      dataEnd:
        filteredData[filteredData.length - 1][
          SHEET_CONFIGS[sheet].columnOrder.Timestamp
        ]
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'No further details';
    // eslint-disable-next-line no-console
    console.error(`Error: ${message}`);
    return formatErrorResponse({
      message: `POST /summary failed with error: ${message}`
    });
  }
};

export const main = middyfy(summary);
