import { FEEDBACK_SHEET_CONFIG } from '../constants';

export const determineTabFromUrl = (pageUrl: string) => {
  const filteredTabs = FEEDBACK_SHEET_CONFIG.filteredTabs;
  const allPages = Object.keys(filteredTabs);
  for (const page of allPages) {
    if (pageUrl.toLowerCase().includes(filteredTabs[page].url)) {
      return FEEDBACK_SHEET_CONFIG.filteredTabs[page];
    }
  }
  return FEEDBACK_SHEET_CONFIG.defaultPage;
};
