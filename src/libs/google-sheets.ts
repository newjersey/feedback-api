import { google, sheets_v4 } from 'googleapis';

export enum Feedback {
  PageURL,
  Rating,
  Comment,
  Email
}

const SHEETS_COLUMN_MAP: { [K in Feedback]: 'B' | 'C' | 'D' | 'E' } = {
  [Feedback.PageURL]: 'B',
  [Feedback.Rating]: 'C',
  [Feedback.Comment]: 'D',
  [Feedback.Email]: 'E'
};

const SHEET_NAME = 'Sheet1';

export async function getAuthClient() {
  const auth = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
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

  const result = await sheetsClient.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: SHEET_NAME,
    valueInputOption: 'RAW',
    requestBody: {
      values: [newRecord]
    }
  });

  if (result.data.updates?.updatedRange == null) {
    throw new Error();
  }

  return getRowFromAppendRange(result.data.updates.updatedRange);
}

export async function updateFeedback(
  sheetsClient: sheets_v4.Sheets,
  feedbackId: number,
  valueType: Feedback,
  value: string
): Promise<number> {
  const result = await sheetsClient.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: SHEET_NAME + '!' + SHEETS_COLUMN_MAP[valueType] + feedbackId,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[value]]
    }
  });

  if (result.data.updatedRange == null) {
    throw new Error();
  }

  return getRowFromUpdateRange(result.data.updatedRange);
}

export function getRowFromAppendRange(sheetsRange: string) {
  return parseInt(sheetsRange.split(':')[1].slice(1));
}

export function getRowFromUpdateRange(sheetsRange: string) {
  return parseInt(sheetsRange.split('!')[1].slice(1));
}
