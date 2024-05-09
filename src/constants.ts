const batchNsmall = 1100;
const batchNLarge = 5000;
const rowCountPrefix = 'Metadata!';

type ChildUrlConfig = {
  batchSize: number;
  prompt: string;
  url: string;
  totalRowsRange: string;
};

type PageChildUrls = {
  [key: string]: ChildUrlConfig;
};

type ParentSheetConfig = {
  sheetId: string;
  totalRowsRange: string;
  tabName: string;
  defaultBatchSize: number;
  urls: PageChildUrls;
  defaultColumnMap: { [key: string]: [string, number] };
  filteredColumnMap: { [key: string]: [string, number] };
};

type SheetConfigs = {
  feedbackWidget: ParentSheetConfig;
  pflSheet: ParentSheetConfig;
};

const feedbackWidgetUrls: PageChildUrls = {
  uistatus: {
    batchSize: batchNsmall,
    prompt: 'applying for Unemployment Insurance benefits',
    url: 'uistatus.dol.state.nj.us',
    totalRowsRange: `${rowCountPrefix}A2`
  },
  'maternity-timeline': {
    batchSize: batchNsmall,
    prompt: 'using the Maternity Timeline Tool',
    url: 'maternity/timeline-tool',
    totalRowsRange: `${rowCountPrefix}A8`
  },
  'claims-status': {
    batchSize: batchNsmall,
    prompt:
      'using an FAQ page explaining what happens after applying for Temporary Disability or Family Leave benefits',
    url: 'claims-status.shtml',
    totalRowsRange: `${rowCountPrefix}A11`
  },
  'login-update': {
    batchSize: batchNsmall,
    prompt:
      'using a page explaining a new way to login system for Temporary Disability and Family Leave benefits',
    url: 'login-update.shtml',
    totalRowsRange: `${rowCountPrefix}A14`
  },
  basicneeds: {
    batchSize: batchNsmall,
    prompt: 'using the New Jersey Basic Needs Hub',
    url: 'basicneeds',
    totalRowsRange: `${rowCountPrefix}A17`
  },
  transgender: {
    batchSize: batchNsmall,
    prompt: 'using the New Jersey Transgender Information Hub',
    url: 'transgender',
    totalRowsRange: `${rowCountPrefix}A20`
  }
};

const pflSheetUrls: PageChildUrls = {
  'claim-detail': {
    batchSize: batchNsmall,
    prompt:
      'after seeing the `Claim detail` page in the Temporary Disability & Family Leave benefits tool',
    url: 'Claim detail',
    totalRowsRange: `${rowCountPrefix}A5`
  },
  other: {
    batchSize: batchNsmall,
    prompt: 'after using the Temporary Disability & Family Leave benefits tool',
    url: 'Other',
    totalRowsRange: `${rowCountPrefix}A17`
  },
  'payment-detail': {
    batchSize: batchNsmall,
    prompt:
      'after seeing the `Payment detail` page in the Temporary Disability & Family Leave benefits tool',
    url: 'Payment detail',
    totalRowsRange: `${rowCountPrefix}A8`
  },
  'application-received': {
    batchSize: batchNsmall,
    prompt:
      'after seeing the `Application Received` page in the Temporary Disability & Family Leave benefits tool',
    url: 'Application received',
    totalRowsRange: `${rowCountPrefix}A11`
  },
  'no-claim': {
    batchSize: batchNsmall,
    prompt:
      'after seeing the `No claim on file` page in the Temporary Disability & Family Leave benefits tool',
    url: 'No claim on file',
    totalRowsRange: `${rowCountPrefix}A5`
  }
};


export const SHEET_CONFIGS: SheetConfigs = {
  feedbackWidget: {
    sheetId: process.env.SHEET_ID,
    totalRowsRange: 'Metadata!A2',
    tabName: 'Sheet1', // used as the default when specific URL isn't found
    defaultBatchSize: batchNLarge,
    urls: feedbackWidgetUrls,
    defaultColumnMap: {
      Timestamp: ['A', 0],
      PageURL: ['B', 1],
      Rating: ['C', 2],
      Comment: ['D', 3],
      Email: ['E', 4]
    },
    filteredColumnMap: {
      Timestamp: ['A', 0],
      PageURL: ['B', 1],
      Comment: ['C', 2]
    }
  },
  pflSheet: {
    sheetId: process.env.PFL_SHEET_ID,
    totalRowsRange: 'Metadata!A2',
    tabName: 'Results',
    defaultBatchSize: batchNsmall,
    urls: pflSheetUrls,
    defaultColumnMap: {
      ResponseID: ['A', 0],
      Timestamp: ['B', 1],
      PageURL: ['C', 2],
      Rating: ['D', 3],
      Comment: ['E', 4]
    },
    filteredColumnMap: {
      Timestamp: ['A', 0],
      PageURL: ['B', 1],
      Comment: ['C', 2]
    }
  }
};
