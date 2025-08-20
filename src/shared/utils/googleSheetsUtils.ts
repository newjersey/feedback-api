import { google, sheets_v4 } from 'googleapis';
import { FeedbackRecord, Feedback } from '../types';

const SHEETS_COLUMN_MAP: { [K in Feedback]: 'A' | 'B' | 'C' | 'D' | 'E' } = {
  [Feedback.Timestamp]: 'A',
  [Feedback.PageURL]: 'B',
  [Feedback.Rating]: 'C',
  [Feedback.Comment]: 'D',
  [Feedback.Email]: 'E'
};
const SHEET_NAME = 'Sheet1';

export async function getAuthClient(clientEmail: string, privateKey: string) {
  try {
    const auth = new google.auth.JWT(
      clientEmail,
      undefined,
      privateKey.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    await auth.authorize();
    return google.sheets({ version: 'v4', auth });
  } catch (e) {
    const error = e as { message?: string };
    throw new Error(`Google Sheets API failed to authorize: ${error?.message}`);
  }
}

export async function createFeedback(
  sheetsClient: sheets_v4.Sheets,
  sheetId: string,
  pageURL: string,
  rating: boolean,
  comment?: string,
  email?: string
): Promise<number> {
  const newRecord: FeedbackRecord = {
    date: Date.now(),
    pageUrl: pageURL,
    rating: rating
  };

  if (comment != null) {
    newRecord.comment = comment;
  }

  if (email != null) {
    newRecord.comment = email;
  }

  try {
    const result = await sheetsClient.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: SHEET_NAME,
      valueInputOption: 'RAW',
      requestBody: {
        values: [Object.values(newRecord)]
      }
    });

    if (result.data.updates?.updatedRange == null) {
      throw new Error('No updated range');
    }
    return getRowFromAppendRange(result.data.updates.updatedRange);
  } catch (e) {
    const error = e as { message?: string };
    throw Error(
      `Google Sheets API failed to create feedback row: ${error?.message}`
    );
  }
}

export async function updateFeedback(
  sheetsClient: sheets_v4.Sheets,
  sheetId: string,
  feedbackId: number,
  valueType: Feedback,
  value: string
): Promise<number> {
  try {
    const result = await sheetsClient.spreadsheets.values.update({
      spreadsheetId: sheetId,
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
    const error = e as { message?: string };
    throw Error(
      `Google Sheets API failed to update feedback row: ${error?.message}`
    );
  }
}

export function getRowFromAppendRange(sheetsRange: string) {
  return parseInt(sheetsRange.split(':')[1].slice(1));
}

export function getRowFromUpdateRange(sheetsRange: string) {
  return parseInt(sheetsRange.split('!')[1].slice(1));
}
