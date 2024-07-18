const rowCountPrefix = 'Metadata!';
type PageConfig = {
  prompt: string;
  tabName: string;
  totalRowsRange: string;
  columnMap;
  isDefault?: boolean;
};
type FilteredPageConfig = PageConfig & { url: string };

type FeedbackFilteredTabs = {
  [key: string]: FilteredPageConfig;
};

const feedbackDefaultColumnMap = {
  timestamp: { index: 0, column: 'A' },
  pageUrl: { index: 1, column: 'B' },
  rating: { index: 2, column: 'C' },
  comment: { index: 3, column: 'D' },
  email: { index: 4, column: 'E' }
};

const feedbackFilteredColumnMap = {
  timestamp: { index: 0, column: 'A' },
  pageUrl: { index: 1, column: 'B' },
  comment: { index: 2, column: 'C' }
};

const feedbackFilteredTabs: FeedbackFilteredTabs = {
  uistatus: {
    prompt: ' applying for Unemployment Insurance benefits',
    tabName: 'uistatus',
    url: 'uistatus',
    totalRowsRange: `${rowCountPrefix}A5`,
    columnMap: feedbackFilteredColumnMap
  },
  'maternity/timeline': {
    prompt: ' using the Maternity Timeline Tool',
    tabName: 'maternity-timeline',
    url: 'maternity/timeline',
    totalRowsRange: `${rowCountPrefix}A8`,
    columnMap: feedbackFilteredColumnMap
  },
  'claims-status': {
    prompt:
      ' using an FAQ page explaining what happens after applying for Temporary Disability or Family Leave benefits',
    tabName: 'claims-status',
    url: 'claims-status',
    totalRowsRange: `${rowCountPrefix}A11`,
    columnMap: feedbackFilteredColumnMap
  },
  'login-update': {
    prompt:
      ' using a page explaining a new way to login system for Temporary Disability and Family Leave benefits',
    tabName: 'login-update',
    url: 'login-update',
    totalRowsRange: `${rowCountPrefix}A14`,
    columnMap: feedbackFilteredColumnMap
  },
  basicneeds: {
    prompt: ' using the New Jersey Basic Needs Hub',
    tabName: 'basicneeds',
    url: 'basicneeds',
    totalRowsRange: `${rowCountPrefix}A17`,
    columnMap: feedbackFilteredColumnMap
  },
  transgender: {
    prompt: ' using the New Jersey Transgender Information Hub',
    tabName: 'transgender',
    url: 'transgender',
    totalRowsRange: `${rowCountPrefix}A20`,
    columnMap: feedbackFilteredColumnMap
  },
  disabilities: {
    prompt: ' using the New Jersey Disability Information Hub',
    tabName: 'disabilities',
    url: 'disabilities',
    totalRowsRange: `${rowCountPrefix}A23`,
    columnMap: feedbackFilteredColumnMap
  },
  'innovation.nj.gov': {
    prompt: ' using the New Jersey Office of Innovation website',
    tabName: 'innovation',
    url: 'innovation.nj.gov',
    totalRowsRange: `${rowCountPrefix}A26`,
    columnMap: feedbackFilteredColumnMap
  },
  'ai-assistant': {
    prompt: ' using the internal New Jersey AI Assistant',
    tabName: 'ai-assistant',
    url: 'ai-assistant',
    totalRowsRange: `${rowCountPrefix}A29`,
    columnMap: feedbackFilteredColumnMap
  }
};
const defaultPageConfig: PageConfig = {
  prompt: ' using the feedback widget',
  tabName: 'Sheet1',
  totalRowsRange: 'Metadata!A2',
  columnMap: feedbackDefaultColumnMap,
  isDefault: true
};

export const FEEDBACK_SHEET_CONFIG = {
  sheetId: process.env.SHEET_ID,
  filteredTabs: feedbackFilteredTabs,
  defaultPage: defaultPageConfig
};
