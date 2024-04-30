import { google } from 'googleapis';
import { getAuthClient, getLastNComments } from './google-sheets';
import { SHEET_CONFIGS } from '../constants';

const MOCK_AUTHORIZE = jest.fn().mockResolvedValue(undefined);
const MOCK_SHEETS = {
  spreadsheets: {
    values: {
      get: jest.fn(),
      append: jest.fn(),
      update: jest.fn()
    }
  }
};

jest.mock('googleapis', () => {
  const originalModule = jest.requireActual('googleapis');
  return {
    ...originalModule,
    google: {
      ...originalModule.google,
      auth: {
        JWT: jest.fn().mockImplementation(() => ({ authorize: MOCK_AUTHORIZE }))
      },
      sheets: jest.fn().mockImplementation(() => MOCK_SHEETS)
    }
  };
});

jest.mock('../constants', () => ({
  SHEET_CONFIGS: {
    exampleSheet: {
      sheetId: 'testSheetID',
      totalRowsRange: 'Metadata!A2',
      sheetName: 'Sheet1',
      urls: {
        'exampleUrl.com': {
          prompt: 'example prompt',
          batchSize: 4
        },
        'exampleUrl2.com': {
          prompt: 'example prompt',
          batchSize: 4
        }
      },
      defaultColumnMap: {
        PageURL: ['A',0],
        Comment: ['B',1]
      }
    }
  }
}));

describe('google-sheets', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthClient', () => {
    it('should successfully create and authorize a Google Sheets API client', async () => {
      const client = await getAuthClient();
      expect(google.auth.JWT).toHaveBeenCalledWith(
        process.env.CLIENT_EMAIL,
        null,
        'test-key\n',
        ['https://www.googleapis.com/auth/spreadsheets']
      );
      expect(MOCK_AUTHORIZE).toHaveBeenCalled();
      expect(google.sheets).toHaveBeenCalledWith({
        version: 'v4',
        auth: { authorize: MOCK_AUTHORIZE }
      });
      expect(client).toEqual(MOCK_SHEETS);
    });

    it('should throw an error if authorization fails', async () => {
      MOCK_AUTHORIZE.mockRejectedValueOnce(new Error('Failed to authorize'));
      await expect(getAuthClient()).rejects.toThrow(
        'Google Sheets API failed to authorize: Failed to authorize'
      );
    });
  });

  describe('getLastNComments', () => {
    
    const exampleKnownUrl1 = 'exampleUrl.com';
    const exampleKnownUrl2 = 'exampleUrl2.com'
    const sheet = 'exampleSheet';

    it('should return an empty array if the totalRows in a sheet is < 2', async () => {
      const n = 3;
      const sheetsClient = google.sheets('v4');
      MOCK_SHEETS.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [['1']] }
      });
      const comments = await getLastNComments(
        sheetsClient,
        n,
        exampleKnownUrl1,
        sheet
      );
      expect(comments).toEqual([]);
    });

    it('should make one request for comments when requested comments (n) < # filtered comments returned in first call', async () => {
      const n = 3;
      const returnedComments = [
        [exampleKnownUrl1, 'Comment 1'],
        [`${exampleKnownUrl1}/extra`, 'Comment 2'],
        [exampleKnownUrl1, 'Comment 3'],
        [`${exampleKnownUrl1}/`, 'Comment 4']
      ];
      const expectedComments = [
        [`${exampleKnownUrl1}/extra`, 'Comment 2'],
        [exampleKnownUrl1, 'Comment 3'],
        [`${exampleKnownUrl1}/`, 'Comment 4']
      ];
      const sheetsClient = google.sheets('v4');
      MOCK_SHEETS.spreadsheets.values.get
        .mockResolvedValueOnce({ data: { values: [['4']] } }) // called in  getTotalRows
        .mockResolvedValueOnce({ data: { values: returnedComments } }); // called in getLastNComments
      const comments = await getLastNComments(sheetsClient, n, exampleKnownUrl1, sheet);
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[0][0]).toEqual({
        spreadsheetId: 'testSheetID',
        range: 'Metadata!A2'
      });
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[1][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[sheet].sheetId,
        range: 'Sheet1!A2:B4'
      });
      expect(comments).toEqual(expectedComments);
      expect(MOCK_SHEETS.spreadsheets.values.get).toHaveBeenCalledTimes(2);
    });

    it('should make additional requests for comments when requested comments (n) > batch size', async () => {
      // batch size set to 4
      const n = 5;
      const returnedComments1stCall = [
        [exampleKnownUrl1, 'Comment 7'],
        [`${exampleKnownUrl1}/extra`, 'Comment 8'],
        [exampleKnownUrl1, 'Comment 9'],
        [`${exampleKnownUrl1}/`, 'Comment 10']
      ];

      const returnedComments2ndCall = [
        [exampleKnownUrl1, 'Comment 3'],
        [`${exampleKnownUrl1}/extra`, 'Comment 4'],
        [`${exampleKnownUrl1}/more`, 'Comment 5'],
        [`${exampleKnownUrl1}/`, 'Comment 6']
      ];

      const expectedComments = [
        [`${exampleKnownUrl1}/`, 'Comment 6'],
        [exampleKnownUrl1, 'Comment 7'],
        [`${exampleKnownUrl1}/extra`, 'Comment 8'],
        [exampleKnownUrl1, 'Comment 9'],
        [`${exampleKnownUrl1}/`, 'Comment 10']
      ];
      const sheetsClient = google.sheets('v4');
      MOCK_SHEETS.spreadsheets.values.get
        .mockResolvedValueOnce({ data: { values: [['11']] } }) // called in  getTotalRows
        .mockResolvedValueOnce({ data: { values: returnedComments1stCall } }) // first call to get comments
        .mockResolvedValueOnce({ data: { values: returnedComments2ndCall } }); // second call to get comments
      const comments = await getLastNComments(
        sheetsClient,
        n,
        exampleKnownUrl1,
        sheet
      );
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[0][0]).toEqual({
        spreadsheetId: 'testSheetID',
        range: 'Metadata!A2'
      });
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[1][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[sheet].sheetId,
        range: 'Sheet1!A8:B11'
      });
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[2][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[sheet].sheetId,
        range: 'Sheet1!A4:B7'
      });
      expect(comments).toEqual(expectedComments);
      expect(MOCK_SHEETS.spreadsheets.values.get).toHaveBeenCalledTimes(3);
    });

    it('should make additional requests for comments when requested comments (n) > filtered comments in first call', async () => {
      // batch size set to 4
      const n = 5;
      const returnedComments1stCall = [
        [exampleKnownUrl1, 'Comment 7'],
        [`${exampleKnownUrl2}/extra`, 'Comment 8'],
        [exampleKnownUrl2, 'Comment 9'],
        [`${exampleKnownUrl1}/`, 'Comment 10']
      ];

      const returnedComments2ndCall = [
        [exampleKnownUrl1, 'Comment 3'],
        [`${exampleKnownUrl1}/extra`, 'Comment 4'],
        [`${exampleKnownUrl2}/more`, 'Comment 5'],
        [`${exampleKnownUrl1}/`, 'Comment 6']
      ];

      const expectedComments = [
        [exampleKnownUrl1, 'Comment 3'],
        [`${exampleKnownUrl1}/extra`, 'Comment 4'],
        [`${exampleKnownUrl1}/`, 'Comment 6'],
        [exampleKnownUrl1, 'Comment 7'],
        [`${exampleKnownUrl1}/`, 'Comment 10']
      ];
      const sheetsClient = google.sheets('v4');
      MOCK_SHEETS.spreadsheets.values.get
        .mockResolvedValueOnce({ data: { values: [['11']] } }) // called in  getTotalRows
        .mockResolvedValueOnce({ data: { values: returnedComments1stCall } }) // first call to get comments
        .mockResolvedValueOnce({ data: { values: returnedComments2ndCall } }); // second call to get comments
      const comments = await getLastNComments(sheetsClient, n, exampleKnownUrl1, sheet);
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[0][0]).toEqual({
        spreadsheetId: 'testSheetID',
        range: 'Metadata!A2'
      });
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[1][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[sheet].sheetId,
        range: 'Sheet1!A8:B11'
      });
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[2][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[sheet].sheetId,
        range: 'Sheet1!A4:B7'
      });
      expect(comments).toEqual(expectedComments);
      expect(MOCK_SHEETS.spreadsheets.values.get).toHaveBeenCalledTimes(3);
    });

    it('should not make additional requests for comments if there are not enough rows in the sheet to satisfy requested amount', async () => {
      // batch size set to 4
      const n = 10;
      const returnedComments1stCall = [
        [exampleKnownUrl1, 'Comment 3'],
        [`${exampleKnownUrl1}/extra`, 'Comment 4'],
        [exampleKnownUrl1, 'Comment 5'],
        [`${exampleKnownUrl1}/`, 'Comment 6']
      ];

      const returnedComments2ndCall = [
        [exampleKnownUrl1, 'Comment 1'],
        [`${exampleKnownUrl1}/extra`, 'Comment 2'],
      ];

      const expectedComments = [
        [exampleKnownUrl1, 'Comment 1'],
        [`${exampleKnownUrl1}/extra`, 'Comment 2'],
        [exampleKnownUrl1, 'Comment 3'],
        [`${exampleKnownUrl1}/extra`, 'Comment 4'],
        [exampleKnownUrl1, 'Comment 5'],
        [`${exampleKnownUrl1}/`, 'Comment 6']
      ];
      const sheetsClient = google.sheets('v4');
      MOCK_SHEETS.spreadsheets.values.get
        .mockResolvedValueOnce({ data: { values: [['7']] } }) // called in  getTotalRows
        .mockResolvedValueOnce({ data: { values: returnedComments1stCall } }) // first call to get comments
        .mockResolvedValueOnce({ data: { values: returnedComments2ndCall } }); // second call to get comments
      const comments = await getLastNComments(sheetsClient, n, exampleKnownUrl1, sheet);
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[0][0]).toEqual({
        spreadsheetId: 'testSheetID',
        range: 'Metadata!A2'
      });
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[1][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[sheet].sheetId,
        range: 'Sheet1!A4:B7'
      });
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[2][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[sheet].sheetId,
        range: 'Sheet1!A2:B3'
      });
      expect(comments).toEqual(expectedComments);
      expect(MOCK_SHEETS.spreadsheets.values.get).toHaveBeenCalledTimes(3);
    });

    it('should throw an error when failing to get row count from getTotalRows', async () => {
      // first call within getTotalRows fails
      MOCK_SHEETS.spreadsheets.values.get.mockRejectedValueOnce(
        new Error('Failed to get row count')
      );
      const sheetsClient = google.sheets('v4');
      await expect(
        getLastNComments(sheetsClient, 10, exampleKnownUrl1, sheet)
      ).rejects.toThrow(
        'Google Sheets API failed to get data size: Failed to get row count')
    });

    it('should throw an error when failing to get comments', async () => {
      // first call within getTotalRows is successful
      MOCK_SHEETS.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [['2']] }
      });
      MOCK_SHEETS.spreadsheets.values.get.mockRejectedValueOnce(
        new Error('Failed to fetch comments')
      );
      const sheetsClient = google.sheets('v4');
      await expect(
        getLastNComments(sheetsClient, 10, exampleKnownUrl1, sheet)
      ).rejects.toThrow(
        'Google Sheets API failed to get input data: Failed to fetch comments'
      );
    });
  });
});
