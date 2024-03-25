import {
  formatErrorResponse,
  ValidatedEventAPIGatewayProxyEvent
} from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { getAuthClient, getLastNComments } from '@libs/google-sheets';
import { SHEET_CONFIGS } from '../../constants';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import { getSummary } from '@libs/chat-gpt';
import { resolvedUrl } from '@libs/url-resolver';


const INPUT_SIZE = 1000; // Maximum number of comments to summarize
const summary: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { pageURL } = event.body;
  const sheet =
    event.body.sheet !== undefined ? event.body.sheet : 'feedbackWidget';
  const resolvedURL = resolvedUrl(pageURL, sheet);
  try {
    const client = await getAuthClient();
    const comments = await getLastNComments(
      client,
      INPUT_SIZE,
      resolvedURL,
      sheet
    );
    if (comments.length === 0) {
      return formatJSONResponse({
        message: 'No data found',
        dataSize: 0
      });
    }
    const cleanedComments = comments.map((v) =>
      v[SHEET_CONFIGS[sheet].columnOrder.Comment].trim()
    );
    const dataSummary = await getSummary(cleanedComments, sheet, resolvedURL);
    return formatJSONResponse({
      message: 'Success',
      dataSummary,
      dataSize: comments.length,
      dataStart: comments[0][SHEET_CONFIGS[sheet].columnOrder.Timestamp],
      dataEnd:
        comments[comments.length - 1][
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
