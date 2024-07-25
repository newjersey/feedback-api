import { FEEDBACK_SHEET_CONFIG } from '../constants';

export const determineTabFromUrl = (pageUrl: string) => {
  const tabs = FEEDBACK_SHEET_CONFIG.tabs;
  const allFilteredPages = Object.keys(tabs).filter(
    (page) => FEEDBACK_SHEET_CONFIG.tabs[page].isDefault !== true
  );
  for (const page of allFilteredPages) {
    if (pageUrl.toLowerCase().includes(tabs[page].url.toLowerCase())) {
      return tabs[page];
    }
  }
  return FEEDBACK_SHEET_CONFIG.tabs.default;
};
