import { getSheetTab } from './tab-resolver';

jest.mock('../constants', () => ({
  SHEET_CONFIGS: {
    exampleSheet1: {
      tabName: 'DefaultParentTab1',
      urls: {
        'example site 1': {
          url: 'exampleUrl1.com'
        },
        'example site 2': {
          url: 'exampleUrl2.com'
        }
      }
    }
  }
}));

describe('resolveSheetTab', () => {
  it('should return the correct child sheet tab and URL when the the request URL includes a known child URL from the sheet', () => {
    const requestUrl = 'https://EXAMPLEUrl1.com/more-to-the-url';
    const sheet = 'exampleSheet1';
    const result = getSheetTab(requestUrl, sheet);
    expect(result).toEqual({
      useDefaultSheet: false,
      resolvedUrl: 'exampleUrl1.com',
      sheetTabName: 'example site 1'
    });
  });

  it('should return the default tab parent sheet when the the request URL is not a known URL from the sheet', () => {
    const requestUrl = 'https://example.com/sheet3';
    const sheet = 'exampleSheet1';
    const result = getSheetTab(requestUrl, sheet);
    expect(result).toEqual({
      useDefaultSheet: true,
      resolvedUrl: 'https://example.com/sheet3',
      sheetTabName: 'DefaultParentTab1'
    });
  });
});
