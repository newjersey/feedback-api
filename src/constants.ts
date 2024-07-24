const ROW_COUNT_PREFIX = 'Metadata!';

type TabConfig = {
  promptCustomization: string;
  tabName: string;
  totalRowsRange: string;
  columnMap;
  isDefault?: true;
  url?: string;
};

type Tabs = {
  [tab: string]: TabConfig;
};

type ColumnMap = {
  timestamp: { index: number; column: string };
  pageUrl: { index: number; column: string };
  comment: { index: number; column: string };
  [columnName: string]: { index: number; column: string };
};

const FEEDBACK_DEFAULT_MAP: ColumnMap = {
  timestamp: { index: 0, column: 'A' },
  pageUrl: { index: 1, column: 'B' },
  rating: { index: 2, column: 'C' },
  comment: { index: 3, column: 'D' }
};

const FEEDBACK_FILTERED_MAP: ColumnMap = {
  timestamp: { index: 0, column: 'A' },
  pageUrl: { index: 1, column: 'B' },
  comment: { index: 2, column: 'C' }
};

const FEEDBACK_TABS: Tabs = {
  uistatus: {
    promptCustomization:
      'written by residents of New Jersey about their experience applying for Unemployment Insurance benefits',
    tabName: 'uistatus',
    url: 'uistatus',
    totalRowsRange: `${ROW_COUNT_PREFIX}A5`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  maternityTimeline: {
    promptCustomization:
      'written by residents of New Jersey about their experience using the Maternity Timeline Tool',
    tabName: 'maternity-timeline',
    url: 'maternity/timeline',
    totalRowsRange: `${ROW_COUNT_PREFIX}A8`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  claimsStatus: {
    promptCustomization:
      'written by residents of New Jersey about their experience using an FAQ page explaining what happens after applying for Temporary Disability or Family Leave benefits',
    tabName: 'claims-status',
    url: 'claims-status',
    totalRowsRange: `${ROW_COUNT_PREFIX}A11`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  loginUpdate: {
    promptCustomization:
      'written by residents of New Jersey about their experience using a page explaining a new way to login system for Temporary Disability and Family Leave benefits',
    tabName: 'login-update',
    url: 'login-update',
    totalRowsRange: `${ROW_COUNT_PREFIX}A14`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  basicNeeds: {
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
  innovation: {
    promptCustomization:
      'written by residents of New Jersey about their experience using the New Jersey Office of Innovation website',
    tabName: 'innovation',
    url: 'innovation.nj.gov',
    totalRowsRange: `${ROW_COUNT_PREFIX}A26`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  aiAssistant: {
    promptCustomization:
      'written by New Jersey State government employees about their experience using the internal New Jersey AI Assistant tool',
    tabName: 'ai-assistant',
    url: 'ai-assistant',
    totalRowsRange: `${ROW_COUNT_PREFIX}A29`,
    columnMap: FEEDBACK_FILTERED_MAP
  },
  default: {
    promptCustomization: 'written by residents of New Jersey',
    tabName: 'Sheet1',
    totalRowsRange: 'Metadata!A2',
    columnMap: FEEDBACK_DEFAULT_MAP,
    isDefault: true
  }
};

export const FEEDBACK_SHEET_CONFIG = {
  sheetId: process.env.SHEET_ID,
  tabs: FEEDBACK_TABS
};
