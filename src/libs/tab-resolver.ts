import { SHEET_CONFIGS } from '../constants';

export const getSheetTab = (
  requestUrl: string,
  sheet: string
): { useDefaultSheet:boolean, resolvedUrl: string; sheetTabName: string } => {
  const knownUrls = SHEET_CONFIGS[sheet].urls;

  for (const knownUrl in knownUrls) {
    const knownLowercase = knownUrls[knownUrl].url.toLowerCase();
    const requestToLowerCase = requestUrl.toLowerCase();

    // console.log('intabResolver','knownLowercase', knownLowercase,'requestUrl.toLowerCase()', requestUrl.toLowerCase() )
    if (requestToLowerCase.includes(knownLowercase)) {
      console.log('word was found!')
      return {
        useDefaultSheet: false,
        resolvedUrl: knownUrls[knownUrl].url,
        sheetTabName: knownUrl
      };
    }
  }
  // if the URL isn't known, we return is as the resolved Url and use the higher level not-filtered sheet
  return {
    useDefaultSheet: true,
    resolvedUrl: requestUrl,
    sheetTabName: SHEET_CONFIGS[sheet].tabName
  };
};


// we will always request the sheet
// if the url is a known url within the sheet
  // we should return the related tab
// if the url is NOT known, we need to filter throughout the whole thing 