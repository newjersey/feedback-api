import { google } from 'googleapis';
import { getAuthClient, getLastNComments } from './google-sheets';

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
    const filteredTab = {
      tabName: 'filtered-tab',
      url: 'knownUrl.com',
      totalRowsRange: 'Metadata!A2',
      columnMap: {
        comment: { index: 0, column: 'A' }
      }
    };

    const defaultTab = {
      tabName: 'default-tab',
      totalRowsRange: 'Metadata!A5',
      columnMap: {
        pageUrl: { index: 0, column: 'A' },
        comment: { index: 1, column: 'B' }
      },
      isDefault: true
    };
    const headerRowCount = 1; // header row is not included in the totalRows count
    const commentRows = [['Comment 1'], ['Comment 2']];
    const commentRowsWithEmptyFields = [['Comment 1'], []];
    const commentRowsinDefaultTab = [
      ['knownUrl.com/moreinfo', 'Comment 1'],
      ['other.com/x', 'Comment 2'],
      ['other.com/y', 'Comment 3'],
      ['different.com/z', 'Comment 4']
    ];
    const noNonEmptyCommentsinDefaulTab = [
      ['knownUrl.com/moreinfo', 'Comment 1'],
      ['other.com/x', ''],
      ['other.com/y', ''],
      ['different.com/z', 'Comment 4']
    ];
    const testCases = [
      {
        totalRows: headerRowCount + commentRows.length, // 3
        pageURL: 'www.knownUrl.com/moreinfo',
        n: 2,
        tabInfo: filteredTab,
        expectedRange: 'filtered-tab!A2:A3',
        rowsReturnedFromSheet: commentRows,
        lastNComments: commentRows,
        description:
          'should retrieve comments from expected range when n is less or equal than available comments'
      },
      {
        totalRows: headerRowCount + commentRows.length, // 3
        n: 1000,
        tabInfo: filteredTab,
        pageURL: 'www.knownUrl.com/moreinfo',
        expectedRange: 'filtered-tab!A2:A3',
        rowsReturnedFromSheet: commentRows,
        lastNComments: commentRows,
        description:
          'should retrieve comments from expected range when n is greater than available comments (returns all rows excluding header row)'
      },
      {
        totalRows: headerRowCount + commentRowsWithEmptyFields.length, // 3
        pageURL: 'www.knownUrl.com/moreinfo',
        n: 2,
        tabInfo: filteredTab,
        expectedRange: 'filtered-tab!A2:A3',
        rowsReturnedFromSheet: commentRowsWithEmptyFields,
        lastNComments: [['Comment 1']],
        description:
          'should only return comments that have content and filter out rows with no empty comments'
      },
      {
        totalRows: headerRowCount + commentRowsinDefaultTab.length, // 5
        pageURL: 'other.com',
        n: 4,
        tabInfo: defaultTab,
        expectedRange: 'default-tab!A2:B5',
        rowsReturnedFromSheet: commentRowsinDefaultTab,
        lastNComments: [
          ['other.com/x', 'Comment 2'],
          ['other.com/y', 'Comment 3']
        ],
        description:
          'should only return comments from default sheet tab that include the pageURL passed in'
      },
      {
        totalRows: headerRowCount + noNonEmptyCommentsinDefaulTab.length, // 5
        pageURL: 'other.com',
        n: 4,
        tabInfo: defaultTab,
        expectedRange: 'default-tab!A2:B5',
        rowsReturnedFromSheet: noNonEmptyCommentsinDefaulTab,
        lastNComments: [],
        description:
          'should return empty array when default sheet tab has no non-empty comments related to the pageURL passed in'
      }
    ];

    it.each(testCases)(
      '$description',
      async ({
        n,
        expectedRange,
        rowsReturnedFromSheet,
        totalRows,
        pageURL,
        tabInfo,
        lastNComments
      }) => {
        MOCK_SHEETS.spreadsheets.values.get
          .mockResolvedValueOnce({ data: { values: [[`${totalRows}`]] } }) // called in  getTotalRows to get totalRows in sheet
          .mockResolvedValueOnce({ data: { values: rowsReturnedFromSheet } }); // called in getLastNComments to get comment rows in sheet
        const sheetsClient = google.sheets('v4');
        const comments = await getLastNComments(
          sheetsClient,
          n,
          pageURL,
          tabInfo
        );
        expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[0][0]).toEqual({
          spreadsheetId: process.env.SHEET_ID,
          range: tabInfo.totalRowsRange
        });
        expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[1][0]).toEqual({
          spreadsheetId: process.env.SHEET_ID,
          range: expectedRange
        });
        expect(comments).toEqual(lastNComments);
      }
    );

    it('should throw an error when failing to get row count from getTotalRows', async () => {
      // first call within getTotalRows fails
      MOCK_SHEETS.spreadsheets.values.get.mockRejectedValueOnce(
        new Error('Failed to get row count')
      );
      const sheetsClient = google.sheets('v4');
      await expect(
        getLastNComments(sheetsClient, 2, 'testUrl.com', filteredTab)
      ).rejects.toThrow(
        'Google Sheets API failed to get data size: Failed to get row count'
      );
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
        getLastNComments(sheetsClient, 2, 'testUrl.com', filteredTab)
      ).rejects.toThrow(
        'Google Sheets API failed to get input data: Failed to fetch comments'
      );
    });
  });
});
