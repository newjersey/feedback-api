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
import { getSheetTab } from '@libs/tab-resolver';


const INPUT_SIZE = 1000; // Maximum number of comments to summarize
const summary: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { sheet, pageURL } = event.body;
  const { resolvedUrl, sheetTabName,useDefaultSheet } = getSheetTab(pageURL, sheet);
  try {
    const client = await getAuthClient();
    console.log('pageURL',pageURL,'resolvedUrl', resolvedUrl, 'sheetTabName', sheetTabName, 'sheet', sheet)
// pageURL https://www.nj.gov/labor/myleavebenefits/worker/resources/login-update.shtml
//resolvedUrl login-update.shtml 
//sheetTabName login-update 
//sheet feedbackWidget
    const comments = await getLastNComments(
      client,
      INPUT_SIZE,
      resolvedUrl, 
      sheetTabName, // known: claim-detail, unknown: Result
      sheet, // pflSheet
      useDefaultSheet
    );
    if (comments.length === 0) {
      return formatJSONResponse({
        message: 'No data found',
        dataSize: 0
      });
    }
    const columnMap = useDefaultSheet
        ? SHEET_CONFIGS[sheet].defaultColumnMap
        : SHEET_CONFIGS[sheet].filteredColumnMap;

    const cleanedComments = comments.map((v) =>
      v[columnMap.Comment[1]].trim()
    );

    const dataSummary = await getSummary(cleanedComments, sheet, sheetTabName); //pflSheet, other
    return formatJSONResponse({
      message: 'Success',
      dataSummary,
      dataSize: comments.length,
      dataStart: comments[0][SHEET_CONFIGS[sheet].defaultColumnMap.Timestamp[1]],
      dataEnd:
        comments[comments.length - 1][
          SHEET_CONFIGS[sheet].defaultColumnMap.Timestamp[1]
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
