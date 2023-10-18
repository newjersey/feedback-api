import {
  formatErrorResponse,
  ValidatedEventAPIGatewayProxyEvent
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { Feedback, getAuthClient, getLastNComments } from '@libs/google-sheets';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import { getSummary } from '@libs/chat-gpt';

const INPUT_SIZE_FREQUENT = 1000;
const INPUT_SIZE_SPARSE = INPUT_SIZE_FREQUENT * 5;

const SHEETS_COLUMN_MAP: { [K in Feedback]: 0 | 1 | 2 | 3 | 4 } = {
  [Feedback.Timestamp]: 0,
  [Feedback.PageURL]: 1,
  [Feedback.Rating]: 2,
  [Feedback.Comment]: 3,
  [Feedback.Email]: 4
};

const summary: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { pageURL } = event.body;
  const dataReach = pageURL.includes('uistatus')
    ? INPUT_SIZE_FREQUENT
    : INPUT_SIZE_SPARSE;

  try {
    const client = await getAuthClient();
    const data = await getLastNComments(client, dataReach);

    const filteredData = data.filter((v) =>
      v[SHEETS_COLUMN_MAP[Feedback.PageURL]].includes(pageURL)
    );
    const cleanedComments = filteredData.map((v) =>
      v[SHEETS_COLUMN_MAP[Feedback.Comment]].trim()
    );
    const dataSummary = await getSummary(cleanedComments, pageURL);

    return formatJSONResponse({
      message: 'Success',
      dataSummary,
      dataSize: filteredData.length,
      dataStart: filteredData[0][SHEETS_COLUMN_MAP[Feedback.Timestamp]],
      dataEnd:
        filteredData[filteredData.length - 1][
          SHEETS_COLUMN_MAP[Feedback.Timestamp]
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
