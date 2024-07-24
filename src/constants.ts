const ROW_COUNT_PREFIX = 'Metadata!';

type PageConfig = {
  promptCustomization: string;
  tabName: string;
  totalRowsRange: string;
  columnMap;
  isDefault?: boolean;
};
type FilteredPageConfig = PageConfig & { url: string };

type FeedbackFilteredTabs = {
  [key: string]: FilteredPageConfig;
};

const FEEDBACK_DEFAULT_MAP = {
  timestamp: { index: 0, column: 'A' },
  pageUrl: { index: 1, column: 'B' },
  rating: { index: 2, column: 'C' },
  comment: { index: 3, column: 'D' }
};

const FEEDBACK_FILTERED_MAP = {
  timestamp: { index: 0, column: 'A' },
  pageUrl: { index: 1, column: 'B' },
  comment: { index: 2, column: 'C' }
};

const FEEDBACK_FILTERED_TABS: FeedbackFilteredTabs = {
  uistatus: {
    promptCustomization:
      'written by residents of New Jersey about their experience applying for Unemployment Insurance benefits',
    tabName: 'uistatus',
    url: 'uistatus',
    totalRowsRange: `${ROW_COUNT_PREFIX}A5`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  'maternity/timeline': {
    promptCustomization:
      'written by residents of New Jersey about their experience using the Maternity Timeline Tool',
    tabName: 'maternity-timeline',
    url: 'maternity/timeline',
    totalRowsRange: `${ROW_COUNT_PREFIX}A8`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  'claims-status': {
    promptCustomization:
      'written by residents of New Jersey about their experience using an FAQ page explaining what happens after applying for Temporary Disability or Family Leave benefits',
    tabName: 'claims-status',
    url: 'claims-status',
    totalRowsRange: `${ROW_COUNT_PREFIX}A11`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  'login-update': {
    promptCustomization:
      '  written by residents of New Jersey about their experience using a page explaining a new way to login system for Temporary Disability and Family Leave benefits',
    tabName: 'login-update',
    url: 'login-update',
    totalRowsRange: `${ROW_COUNT_PREFIX}A14`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  basicneeds: {
    promptCustomization:
      'written by residents of New Jersey about their experience using the New Jersey Basic Needs Hub',
    tabName: 'basicneeds',
    url: 'basicneeds',
    totalRowsRange: `${ROW_COUNT_PREFIX}A17`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  transgender: {
    promptCustomization:
      'written by residents of New Jersey about their experience using the New Jersey Transgender Information Hub',
    tabName: 'transgender',
    url: 'transgender',
    totalRowsRange: `${ROW_COUNT_PREFIX}A20`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  disabilities: {
    promptCustomization:
      'written by residents of New Jersey about their experience using the New Jersey Disability Information Hub',
    tabName: 'disabilities',
    url: 'disabilities',
    totalRowsRange: `${ROW_COUNT_PREFIX}A23`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  'innovation.nj.gov': {
    promptCustomization:
      'written by residents of New Jersey about their experience using the New Jersey Office of Innovation website',
    tabName: 'innovation',
    url: 'innovation.nj.gov',
    totalRowsRange: `${ROW_COUNT_PREFIX}A26`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  'ai-assistant': {
    promptCustomization:
      'written by New Jersey State government employees about their experience using the internal New Jersey AI Assistant tool',
    tabName: 'ai-assistant',
    url: 'ai-assistant',
    totalRowsRange: `${ROW_COUNT_PREFIX}A29`,
    columnMap: FEEDBACK_FILTERED_MAP
  }
};
const DEFAULT_PAGE_CONFIG: PageConfig = {
  promptCustomization: 'written by residents of New Jersey',
  tabName: 'Sheet1',
  totalRowsRange: 'Metadata!A2',
  columnMap: FEEDBACK_DEFAULT_MAP,
  isDefault: true
};

export const FEEDBACK_SHEET_CONFIG = {
  sheetId: process.env.SHEET_ID,
  filteredTabs: FEEDBACK_FILTERED_TABS,
  defaultPage: DEFAULT_PAGE_CONFIG
};
