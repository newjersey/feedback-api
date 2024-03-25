import { SHEET_CONFIGS } from '../constants';

export const resolvedUrl = (pageURL: string, sheet: string): string => {
  const urls = SHEET_CONFIGS[sheet].urls;
  for (const url of Object.keys(urls)) {
    if (pageURL.includes(url)) {
      return url;
    }
  }
  return pageURL;
};
