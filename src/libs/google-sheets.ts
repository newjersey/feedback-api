import { google, sheets_v4 } from 'googleapis';

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

export const SHEET_CONFIGS = {
  feedbackWidget: {
    sheetId: process.env.SHEET_ID,
    totalRowsRange: 'Metadata!A2',
    sheetName: 'Sheet1',
    relevantUrls: [
      'uistatus.dol.state.nj.us',
      'maternity/timeline-tool',
      'myleavebenefits/worker/resources/claims-status.shtml',
      'myleavebenefits/worker/resources/login-update',
      'transgender',
      'basicneeds'
    ],
    columnMap: {
      Timestamp: 'A',
      PageURL: 'B',
      Rating: 'C',
      Comment: 'D',
      Email: 'E'
    },
    columnOrder: {
      Timestamp: 0,
      PageURL: 1,
      Rating: 2,
      Comment: 3,
      Email: 4
    }
  },
  pflSheet: {
    sheetId: process.env.PFL_SHEET_ID,
    totalRowsRange: 'Metadata!A2',
    sheetName: 'Results',
    relevantUrls: [
      'Claim detail',
      'Other',
      'Payment detail',
      'Application received'
    ],
    columnMap: {
      ResponseID: 'A',
      Timestamp: 'B',
      PageURL: 'C',
      Rating: 'D',
      Comment: 'E'
    },
    columnOrder: {
      ResponseID: 0,
      Timestamp: 1,
      PageURL: 2,
      Rating: 3,
      Comment: 4
    }
  }
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

// only used within getLastNComments function
function getSheetConfig(pageURL: string, sheet: keyof typeof SHEET_CONFIGS) {
  for (const url of SHEET_CONFIGS[sheet].relevantUrls) {
    if (pageURL.includes(url)) {
      return url;
    }
  }
  // if url is not recognized, default to feedbackWidget
  return pageURL;
}

// only used within getLastNComments function
async function getTotalRows(sheetsClient: sheets_v4.Sheets, sheet) {
  try {
    const result = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: SHEET_CONFIGS[sheet].sheetId,
      range: SHEET_CONFIGS[sheet].totalRowsRange
    });
    return parseInt(result.data.values[0][0]);
  } catch (e) {
    throw Error(`Google Sheets API failed to get data size: ${e.message}`);
  }
}

type GetLastNCommentsType = {
  url: string;
  comments: string[][];
};

export async function getLastNComments(
  sheetsClient: sheets_v4.Sheets,
  n: number,
  pageURL: string,
  sheet: keyof typeof SHEET_CONFIGS
): Promise<GetLastNCommentsType> {
  try {
    const url = getSheetConfig(pageURL, sheet);
    const totalRows = await getTotalRows(sheetsClient, sheet);
    if (totalRows < 2) return { url, comments: [] };
    const startRow = totalRows - 1 < n ? 2 : totalRows - (n - 1);
    const result = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: SHEET_CONFIGS[sheet].sheetId,
      range: `${SHEET_CONFIGS[sheet].sheetName}!A${startRow}:${SHEET_CONFIGS[sheet].columnMap.Comment}${totalRows}`
    });
    return { url, comments: result.data.values };
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
