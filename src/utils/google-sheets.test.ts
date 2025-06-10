import { google } from 'googleapis';
import { getAuthClient } from './google-sheets';

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
    const mockClientEmail = 'hello@hello.com';
    const mockPrivateKey = 'mockKey';

    it('should successfully create and authorize a Google Sheets API client', async () => {
      const client = await getAuthClient(mockClientEmail, mockPrivateKey);
      expect(google.auth.JWT).toHaveBeenCalledWith(
        mockClientEmail,
        null,
        mockPrivateKey,
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
      await expect(
        getAuthClient(mockClientEmail, mockPrivateKey)
      ).rejects.toThrow(
        'Google Sheets API failed to authorize: Failed to authorize'
      );
    });
  });
});
