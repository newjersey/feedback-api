import { SHEET_CONFIGS } from '../constants';

export const getSheetTab = (
  requestUrl: string,
  sheet: string
): { useDefaultSheet: boolean; resolvedUrl: string; sheetTabName: string } => {
  const knownUrls = SHEET_CONFIGS[sheet].urls;
  for (const knownUrl in knownUrls) {
    const knownLowercase = knownUrls[knownUrl].url.toLowerCase();
    const requestToLowerCase = requestUrl.toLowerCase();
    if (requestToLowerCase.includes(knownLowercase)) {
      return {
        useDefaultSheet: false,
        resolvedUrl: knownUrls[knownUrl].url,
        sheetTabName: knownUrl
      };
    }
  }
  // if the URL isn't known, return Url and use the parent sheet
  return {
    useDefaultSheet: true,
    resolvedUrl: requestUrl,
    sheetTabName: SHEET_CONFIGS[sheet].tabName
  };
};
