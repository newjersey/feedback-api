import { google, sheets_v4 } from 'googleapis';
import { SHEET_CONFIGS } from '../constants';
import { isDateInRange } from './date-funcs';
// Feedback enum + SHEETS_COLUMN_MAP currently used in updateFeedback
export enum Feedback {
  PageURL,
  Rating,
  Comment,
  Email,
  Timestamp
}

const SHEETS_COLUMN_MAP: { [K in Feedback]: 'A' | 'B' | 'C' | 'D' | 'E' } = {
  [Feedback.Timestamp]: 'A',
  [Feedback.PageURL]: 'B',
  [Feedback.Rating]: 'C',
  [Feedback.Comment]: 'D',
  [Feedback.Email]: 'E'
};

const SHEET_NAME = 'Sheet1';

export async function getAuthClient() {
  try {
    const auth = new google.auth.JWT(
      process.env.CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    await auth.authorize();
    return google.sheets({ version: 'v4', auth });
  } catch (e) {
    throw new Error(`Google Sheets API failed to authorize: ${e.message}`);
  }
}

// only used within getLastNIterative function
async function getTotalRows(
  sheetsClient: sheets_v4.Sheets,
  sheet: string,
  sheetTabName: string,
  useDefaultSheet: boolean
) {
  try {
    const rangeValue = useDefaultSheet
      ? SHEET_CONFIGS[sheet].totalRowsRange
      : SHEET_CONFIGS[sheet].urls[sheetTabName]?.totalRowsRange;
    const result = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: SHEET_CONFIGS[sheet].sheetId,
      range: rangeValue
    });
    return parseInt(result.data.values[0][0]);
  } catch (e) {
    throw Error(`Google Sheets API failed to get data size: ${e.message}`);
  }
}

export async function getLastNComments(
  sheetsClient: sheets_v4.Sheets,
  n: number,
  pageURL: string,
  sheetTabName: string, // known: claim-detail, unknown: Result
  sheet: string, // pflSheet
  useDefaultSheet: boolean,
  startDate: string,
  endDate: string
): Promise<string[][]> {
  try {
    const totalRows = await getTotalRows(
      sheetsClient,
      sheet,
      sheetTabName,
      useDefaultSheet
    );
    if (totalRows < 2) return [];
    let accumulatedComments = [];
    let currentBatchEnd = totalRows;
    const batchSize = useDefaultSheet
      ? SHEET_CONFIGS[sheet].defaultBatchSize
      : SHEET_CONFIGS[sheet].urls[sheetTabName]?.batchSize;
    while (accumulatedComments.length < n && currentBatchEnd > 1) {
      const currentBatchStart = Math.max(currentBatchEnd - batchSize + 1, 2);
      const columnMap = useDefaultSheet
        ? SHEET_CONFIGS[sheet].defaultColumnMap
        : SHEET_CONFIGS[sheet].filteredColumnMap;
      const result = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: SHEET_CONFIGS[sheet].sheetId,
        range: `${sheetTabName}!A${currentBatchStart}:${columnMap.Comment[0]}${currentBatchEnd}`
      });
      let batchRows = result.data.values;
      const filterByDate = !!startDate || !!endDate;
      if (useDefaultSheet || filterByDate) {
        batchRows = result.data.values?.filter((v) => {
          const dateOfComment = v[columnMap.Timestamp[1]];
          const urlFilterMatches = v[columnMap.PageURL[1]].includes(pageURL);
          const rowCommentIsNotBlank = !!v[columnMap.Comment[1]];
          const dateFilterMatches = isDateInRange(
            startDate,
            endDate,
            dateOfComment
          );
          if (useDefaultSheet && !filterByDate) {
            return urlFilterMatches && rowCommentIsNotBlank;
          }
          if (!useDefaultSheet && filterByDate) {
            return dateFilterMatches;
          }
          if (useDefaultSheet && filterByDate) {
            return (
              urlFilterMatches && rowCommentIsNotBlank && dateFilterMatches
            );
          }
        });
      }
      accumulatedComments = [...batchRows, ...accumulatedComments];
      currentBatchEnd = currentBatchStart - 1;
      if (accumulatedComments.length > n) {
        accumulatedComments = accumulatedComments.slice(-n);
      }
    }
    return accumulatedComments;
  } catch (e) {
    throw Error(`Google Sheets API failed to get input data: ${e.message}`);
  }
}

export async function createFeedback(
  sheetsClient: sheets_v4.Sheets,
  pageURL: string,
  rating: boolean,
  comment?: string,
  email?: string
): Promise<number> {
  const newRecord = [Date.now(), pageURL, rating];
  if (comment != null) newRecord.push(comment);
  if (email != null) newRecord.push(email);

  try {
    const result = await sheetsClient.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: SHEET_NAME,
      valueInputOption: 'RAW',
      requestBody: {
        values: [newRecord]
      }
    });

    if (result.data.updates?.updatedRange == null) {
      throw new Error('No updated range');
    }
    return getRowFromAppendRange(result.data.updates.updatedRange);
  } catch (e) {
    throw Error(
      `Google Sheets API failed to create feedback row: ${e.message}`
    );
  }
}

export async function updateFeedback(
  sheetsClient: sheets_v4.Sheets,
  feedbackId: number,
  valueType: Feedback,
  value: string
): Promise<number> {
  try {
    const result = await sheetsClient.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID,
      range: SHEET_NAME + '!' + SHEETS_COLUMN_MAP[valueType] + feedbackId,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[value]]
      }
    });
    if (result.data.updatedRange == null) {
      throw new Error('No updated range');
    }
    return getRowFromUpdateRange(result.data.updatedRange);
  } catch (e) {
    throw Error(
      `Google Sheets API failed to update feedback row: ${e.message}`
    );
  }
}

export function getRowFromAppendRange(sheetsRange: string) {
  return parseInt(sheetsRange.split(':')[1].slice(1));
}

export function getRowFromUpdateRange(sheetsRange: string) {
  return parseInt(sheetsRange.split('!')[1].slice(1));
}
