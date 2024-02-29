import { google } from 'googleapis';
import { getAuthClient, getLastNComments } from './google-sheets';

const MOCK_AUTHORIZE = jest.fn().mockResolvedValue('undefined');
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

describe('google-sheets', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthClient', () => {
    it('should successfully create and authorize a Google Sheets API client', async () => {
      (google.sheets as jest.Mock).mockImplementationOnce(
        () => 'sheets_v4_instance'
      );
      const client = await getAuthClient();
      expect(google.auth.JWT).toHaveBeenCalledWith(
        process.env.CLIENT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets']
      );
      expect(MOCK_AUTHORIZE).toHaveBeenCalled();
      expect(google.sheets).toHaveBeenCalledWith({
        version: 'v4',
        auth: { authorize: MOCK_AUTHORIZE }
      });
      expect(client).toEqual('sheets_v4_instance');
    });

    it('should throw an error if authorization fails', async () => {
      MOCK_AUTHORIZE.mockRejectedValueOnce(new Error('Failed to authorize'));
      await expect(getAuthClient()).rejects.toThrow(
        'Google Sheets API failed to authorize: Failed to authorize'
      );
      expect(google.auth.JWT).toHaveBeenCalledWith(
        process.env.CLIENT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets']
      );
    });
  });

  describe('getLastNComments', () => {
    const testCases = [
      {
        n: 2,
        expectedRange: 'Sheet1!A2:D3',
        expectedComments: [['Comment 1'], ['Comment 2']],
        description:
          'should retrieve comments from expected range when n is less or equal than available comments'
      },
      {
        n: 1000,
        expectedRange: 'Sheet1!A2:D3',
        expectedComments: [['Comment 1'], ['Comment 2']],
        description:
          'should retrieve comments from expected range when n is greater than available comments (returns all rows excluding header row)'
      }
    ];

    it.each(testCases)(
      '$description',
      async ({ n, expectedRange, expectedComments }) => {
        MOCK_SHEETS.spreadsheets.values.get
          .mockResolvedValueOnce({ data: { values: [['3']] } }) // calls getTotalRows
          .mockResolvedValueOnce({ data: { values: expectedComments } }); // getLastNComments response
        const sheetsClient = google.sheets('v4');
        const comments = await getLastNComments(sheetsClient, n);
        expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[0][0]).toEqual({
          spreadsheetId: process.env.SHEET_ID,
          range: 'Metadata!A2'
        });
        expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[1][0]).toEqual({
          spreadsheetId: process.env.SHEET_ID,
          range: expectedRange
        });
        expect(comments).toEqual(expectedComments);
      }
    );

    it('should throw an error when failing to get row count from getTotalRows', async () => {
      MOCK_SHEETS.spreadsheets.values.get.mockRejectedValueOnce(
        new Error('Failed to get row count')
      );
      const sheetsClient = google.sheets('v4');
      await expect(getLastNComments(sheetsClient, 2)).rejects.toThrow(
        'Google Sheets API failed to get data size: Failed to get row count'
      );
    });

    it('should throw an error when failing to get comments', async () => {
      MOCK_SHEETS.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [['2']] }
      });
      MOCK_SHEETS.spreadsheets.values.get.mockRejectedValueOnce(
        new Error('Failed to fetch comments')
      );
      const sheetsClient = google.sheets('v4');
      await expect(getLastNComments(sheetsClient, 2)).rejects.toThrow(
        'Google Sheets API failed to get input data: Failed to fetch comments'
      );
    });
  });
});