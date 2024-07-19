import { determineTabFromUrl } from './tab-resolver';

jest.mock('../constants', () => ({
  FEEDBACK_SHEET_CONFIG: {
    filteredTabs: {
      'test-page': {
        url: 'test-page.com'
      }
    },
    defaultPage: {
      isDefault: true
    }
  }
}));

describe('determineTabFromUrl', () => {
  it('should return the known tab when the pageUrl is a known URL', () => {
    const tab = determineTabFromUrl(`www.TEST-PAGE.com/additional-path`);
    expect(tab).toEqual({ url: 'test-page.com' });
  });

  it('should return the default tab for an unknown URL', () => {
    const tab = determineTabFromUrl('unknown-page.com');
    expect(tab).toEqual({ isDefault: true });
  });
});
