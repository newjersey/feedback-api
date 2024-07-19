import {
  formatErrorResponse,
  ValidatedEventAPIGatewayProxyEvent
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { getAuthClient, getLastNComments } from '@libs/google-sheets';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import { getSummary } from '@libs/chat-gpt';
import { determineTabFromUrl } from '@libs/tab-resolver';

const INPUT_SIZE_FREQUENT = 1000;
const INPUT_SIZE_SPARSE = INPUT_SIZE_FREQUENT * 10;
const MAX_COMMENTS = 1000;

const summary: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  let { pageURL } = event.body;
  pageURL = pageURL.toLowerCase();
  const tabInfo = determineTabFromUrl(pageURL);
  const { columnMap } = tabInfo;
  const dataReach = tabInfo.isDefault ? INPUT_SIZE_SPARSE : INPUT_SIZE_FREQUENT;
  try {
    const client = await getAuthClient();
    let data = await getLastNComments(client, dataReach, pageURL, tabInfo);
    if (data.length === 0) {
      return formatJSONResponse({
        message: 'No data found',
        dataSize: 0
      });
    }
    if (data.length > MAX_COMMENTS) {
      data = data.slice(data.length - MAX_COMMENTS);
    }
    const comments = data.map((v) => v[columnMap.comment.index].trim());
    const dataSummary = await getSummary(comments, pageURL);
    return formatJSONResponse({
      message: 'Success',
      dataSummary,
      dataSize: comments.length,
      dataStart: data[0][columnMap.timestamp.index],
      dataEnd: data[data.length - 1][columnMap.timestamp.index]
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
