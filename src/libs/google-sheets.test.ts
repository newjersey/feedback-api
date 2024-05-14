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
    exampleSheet1: { // conceptual name, does not exist elsewhere
      sheetId: 'testSheetID', // ID in the URL as found in env file
      totalRowsRange: 'Metadata!A2', // the cell where you can find the total row count
      defaultBatchSize: 10,
      tabName: 'defaultParentTab1', // name of tab
      defaultColumnMap: {
        UnrelatedColumn: ['A', 0],
        Timestamp: ['B', 1],
        PageURL: ['C', 2],
        Comment: ['D', 3]
      },
      filteredColumnMap: {
        Timestamp: ['A', 0],
        PageURL: ['B', 1],
        Comment: ['C', 2]
      },
      urls: {
        'childSite1': { // the name of the tab within the same sheet
          url: 'exampleUrl1.com', // what gets fktered
          prompt: 'about site 1',
          batchSize: 4,
          totalRowsRange: `Foo!A100`
        },
        'childSite2': {
          url: 'exampleUrl2.com',
          prompt: 'about site 2',
          totalRowsRange: `Foo!A101`
        }
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
    const parentSheet1 = 'exampleSheet1';
    const sheetTabName1 = SHEET_CONFIGS[parentSheet1].tabName;
    const exampleKnownUrl1 = 'http://exampleUrl1.com';
    const unknownUrl = 'unknownUrl.com';

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
        sheetTabName1,
        parentSheet1,
        true
      );
      expect(comments).toEqual([]);
    });
    it('should use the default sheet tab + column map when useDefaultSheet is true to return filtered list of comments', async () => {
      const useDefaultSheet = true; // use default sheet tab + column map
      const n = 1;
      const totalRows = 3;
      const returnedComments = [
        ['other data', '1715634713', exampleKnownUrl1, 'Comment 1'], // this comment should not be returned in final comments
        ['other data', '1715634715', `${unknownUrl}/more`, 'Comment 2']
      ];
      const sheetsClient = google.sheets('v4');
      MOCK_SHEETS.spreadsheets.values.get
        .mockResolvedValueOnce({ data: { values: [[`${totalRows}`]] } }) // called in getTotalRows
        .mockResolvedValueOnce({ data: { values: returnedComments } }); // called in getLastNComments
      const comments = await getLastNComments(
        sheetsClient,
        n,
        unknownUrl,
        sheetTabName1,
        parentSheet1,
        useDefaultSheet
      );
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[0][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[parentSheet1].sheetId,
        range: SHEET_CONFIGS[parentSheet1].totalRowsRange
      });
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[1][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[parentSheet1].sheetId,
        range: `${sheetTabName1}!A${2}:${
          SHEET_CONFIGS[parentSheet1].defaultColumnMap.Comment[0]
        }${totalRows}`
      });
      expect(comments.length).toEqual(1);
      expect(comments[0][3]).toEqual('Comment 2');
    });

    it('should use the filtered sheet tab + column map when useDefaultSheet is false to return a of comments', async () => {
      const useDefaultSheet = false; // use filtered sheet tab + column map
      const childSheetTabName = 'childSite1'; // sheetTabName
      const n = 1;
      const totalRows = 2;
      const returnedComments = [
        ['other data', '1715634713', exampleKnownUrl1, 'Comment 4'], // this comment should not be returned in final comments
      ];
      const sheetsClient = google.sheets('v4');
      MOCK_SHEETS.spreadsheets.values.get
        .mockResolvedValueOnce({ data: { values: [[`${totalRows}`]] } }) // called in getTotalRows
        .mockResolvedValueOnce({ data: { values: returnedComments } }); // called in getLastNComments
      const comments = await getLastNComments(
        sheetsClient,
        n,
        exampleKnownUrl1,
        childSheetTabName,
        parentSheet1,
        useDefaultSheet // false
      );
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[0][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[parentSheet1].sheetId,
        range:
          SHEET_CONFIGS[parentSheet1].urls[childSheetTabName]?.totalRowsRange
      });
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[1][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[parentSheet1].sheetId,
        range: `${childSheetTabName}!A${2}:${
          SHEET_CONFIGS[parentSheet1].filteredColumnMap.Comment[0]
        }${totalRows}`
      });
      expect(comments.length).toEqual(1);
      expect(comments[0][3]).toEqual('Comment 4');
    });

    it('should make additional calls for comments when requested comments (n) > relevant comments returned in first call based on batch size and correctly return n comments', async () => {
      const useDefaultSheet = false; // use filtered sheet tab + column map
      const childSheetTabName = 'childSite1'; // sheetTabName
      const sheetRange =
        SHEET_CONFIGS[parentSheet1].urls[childSheetTabName]?.totalRowsRange;
      // batch size for childSite1 set to 4
      const n = 5; // filtering for 5 total comments
      const totalRows = 7;
      const returnedComments1 = [
        ['1715634717', exampleKnownUrl1, 'Comment 3'],
        ['1715634718', exampleKnownUrl1, 'Comment 4'],
        ['1715634719', exampleKnownUrl1, 'Comment 5'],
        ['1715634720', exampleKnownUrl1, 'Comment 6']
      ];
      const returnedComments2 = [
        ['1715634715', exampleKnownUrl1, 'Comment 1'],
        ['1715634716', exampleKnownUrl1, 'Comment 2']
      ];
      const sheetsClient = google.sheets('v4');
      MOCK_SHEETS.spreadsheets.values.get
        .mockResolvedValueOnce({ data: { values: [[`${totalRows}`]] } }) // called to initially get total row count via getTotalRows
        .mockResolvedValueOnce({ data: { values: returnedComments1 } }) // called in getLastNComments first time
        .mockResolvedValueOnce({ data: { values: returnedComments2 } }); // called in getLastNComments secons time
      const comments = await getLastNComments(
        sheetsClient,
        n,
        exampleKnownUrl1,
        childSheetTabName,
        parentSheet1,
        useDefaultSheet // false
      );
      expect(MOCK_SHEETS.spreadsheets.values.get).toHaveBeenCalledTimes(3);
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[0][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[parentSheet1].sheetId,
        range: sheetRange
      });
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[1][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[parentSheet1].sheetId,
        range: 'childSite1!A4:C7'
      });
      expect(MOCK_SHEETS.spreadsheets.values.get.mock.calls[2][0]).toEqual({
        spreadsheetId: SHEET_CONFIGS[parentSheet1].sheetId,
        range: 'childSite1!A2:C3'
      });
      expect(comments.length).toEqual(n);
      expect(comments[0][2]).toEqual('Comment 2');
      expect(comments[1][2]).toEqual('Comment 3');
      expect(comments[2][2]).toEqual('Comment 4');
      expect(comments[3][2]).toEqual('Comment 5');
      expect(comments[4][2]).toEqual('Comment 6');
    });

    // end of completed tests

    it('should make correctly filter comments dateRange is included', async () => {
      const useDefaultSheet = false; // use filtered sheet tab + column map
      const childSheetTabName = 'childSite1'; // sheetTabName
      // batch size for childSite1 set to 4
      const n = 4; // filtering for 3 total comments
      const totalRows = 5;
      const startDate = '1715634719';
      const endDate = '1715634722';
      const returnedComments1 = [
        ['1715634717', exampleKnownUrl1, 'Comment 3'], // this comment should not be returned in final comments
        ['1715634718', exampleKnownUrl1, 'Comment 4'], // this comment should not be returned in final comments
        [startDate, exampleKnownUrl1, 'Comment 5'],
        [endDate, exampleKnownUrl1, 'Comment 6']
      ];
      const sheetsClient = google.sheets('v4');
      MOCK_SHEETS.spreadsheets.values.get
        .mockResolvedValueOnce({ data: { values: [[`${totalRows}`]] } }) // called to initially get total row count via getTotalRows
        .mockResolvedValueOnce({ data: { values: returnedComments1 } }); // called in getLastNComments first time
      const comments = await getLastNComments(
        sheetsClient,
        n,
        exampleKnownUrl1,
        childSheetTabName,
        parentSheet1,
        useDefaultSheet, // false
        startDate,
        endDate
      );

      expect(comments.length).toEqual(2);
      expect(comments[0][2]).toEqual('Comment 5');
      expect(comments[1][2]).toEqual('Comment 6');
    });

    it('should throw an error when failing to get row count from getTotalRows', async () => {
      // first call within getTotalRows fails
      MOCK_SHEETS.spreadsheets.values.get.mockRejectedValueOnce(
        new Error('Failed to get row count')
      );
      const sheetsClient = google.sheets('v4');
      await expect(
        getLastNComments(
          sheetsClient,
          10,
          exampleKnownUrl1,
          sheetTabName1,
          parentSheet1,
          true
        )
      ).rejects.toThrow(
        'Google Sheets API failed to get data size: Failed to get row count');
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
        getLastNComments(
          sheetsClient,
          10,
          exampleKnownUrl1,
          sheetTabName1,
          parentSheet1,
          true
        )
      ).rejects.toThrow(
        'Google Sheets API failed to get input data: Failed to fetch comments'
      );
    });
  });
});
