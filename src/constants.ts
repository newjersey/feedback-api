const batchNsmall = 1100;
const batchNLarge = 5000;
const feedbackRowCountPrefix = 'Metadata!';

interface SheetConfig {
  batchSize: number; // how many rows to fetch at a time
  prompt: string; // what prompt to provide to chatgpt
  totalRowsRange : string; // cell within the sheet that contains the total number of rows
  tabName: string; // name of the tab relevant to requested URL
  defaultColumnMap: {}; // column organization of the sheet
  specificColumnMap// columnOrder: {} // column organization of the sheet
  sheetId?: string;
}

interface TopLevelSheetConfig extends SheetConfig {
  sheetId: string;
  urls: SheetConfig[];
}

const filteredSheetConfig = {
  Timestamp: ['A', 0],
  PageURL: ['B', 1],
  Comment: ['C', 2],
}

const feedbackWidgetUrls = {
  uistatus: {
    batchSize: batchNsmall, // Assuming a variable placeholder
    prompt: 'applying for Unemployment Insurance benefits',
    url: 'uistatus.dol.state.nj.us',
    totalRowsRange: `${feedbackRowCountPrefix}A2`,
  },
  'maternity-timeline': {
    batchSize: batchNLarge,
    prompt: 'using the Maternity Timeline Tool',
    url: 'maternity/timeline-tool',
    totalRowsRange: `${feedbackRowCountPrefix}A8`,
  },
  'claims-status': {
    batchSize: batchNLarge,
    prompt: 'using an FAQ page explaining what happens after applying for Temporary Disability or Family Leave benefits',
    url: 'claims-status.shtml',
    totalRowsRange: `${feedbackRowCountPrefix}A11`,
  },
  'login-update': {
    batchSize: batchNLarge,
    prompt: 'using a page explaining a new way to login system for Temporary Disability and Family Leave benefits',
    url: 'login-update.shtml',
    totalRowsRange: `${feedbackRowCountPrefix}A14`,
  },
  basicneeds: {
    batchSize: batchNLarge,
    prompt: 'using the New Jersey Basic Needs Hub',
    url: 'basicneeds',
    totalRowsRange: `${feedbackRowCountPrefix}A17`,
  },
  transgender: {
    batchSize: batchNLarge,
    prompt: 'using the New Jersey Transgender Information Hub',
    url: 'transgender',
    totalRowsRange: `${feedbackRowCountPrefix}A20`,
  }
};

const pflSheetUrls = {
  'claim-detail': {
    batchSize: batchNsmall,
    prompt: 'after seeing the `Claim detail` page in the Temporary Disability & Family Leave benefits tool',
    url: 'Claim detail'
  },
  other: {
    batchSize: batchNsmall,
    prompt: 'after using the Temporary Disability & Family Leave benefits tool',
    url: 'Other'
  },
  'payment-detail': {
    batchSize: batchNsmall,
    prompt: 'after seeing the `Payment detail` page in the Temporary Disability & Family Leave benefits tool',
    url: 'Payment detail'
  },
  'application-received': {
    batchSize: batchNsmall,
    prompt: 'after seeing the `Application Received` page in the Temporary Disability & Family Leave benefits tool',
    url: 'Application received'
  },
  'no-claim': {
    batchSize: batchNsmall,
    prompt: 'after seeing the `No claim on file` page in the Temporary Disability & Family Leave benefits tool',
    url: 'No claim on file'
  }
};



export const SHEET_CONFIGS = {
  feedbackWidget: {
    sheetId: process.env.SHEET_ID,
    totalRowsRange: 'Metadata!A2',
    tabName: 'Sheet1', // used as the default when specific URL isn't found
    defaultBatchSize: batchNLarge,
    urls: feedbackWidgetUrls,
    defaultColumnMap: {
      Timestamp: ['A',0],
      PageURL: ['B',1],
      Rating: ['C',2],
      Comment: ['D',3],
      Email: ['E',4]
    },
    filteredColumnMap: filteredSheetConfig

  },
  pflSheet: {
    sheetId: process.env.PFL_SHEET_ID,
    totalRowsRange: 'Metadata!A2',
    tabName: 'Results',
    defaultBatchSize: batchNsmall,
    urls: pflSheetUrls,
    defaultColumnMap: {
      ResponseID: ['A',0],
      Timestamp: ['B',1],
      PageURL: ['C',2],
      Rating: ['D',3],
      Comment: ['E',4]
    },
    filteredColumnMap: filteredSheetConfig

  }
};



const OLDfeedbackWidgetUrls = {
  'uistatus.dol.state.nj.us': {
    batchSize: batchNsmall,
    prompt: 'applying for Unimployment Insurance benefits',
    tabName: 'uistatus',
    totalRowsRange: `${feedbackRowCountPrefix}A2`
  },
  'maternity/timeline-tool': {
    batchSize: batchNLarge,
    prompt: 'using the Maternity Timeline Tool',
    tabName: 'maternity-timeline',
    totalRowsRange: `${feedbackRowCountPrefix}A8`
  },
  'claims-status.shtml': {
    batchSize: batchNLarge,
    prompt:
      'using an FAQ page explaining what happens after applying for Temporary Disability or Family Leave benefits',
    tabName: 'claims-status',
    totalRowsRange: `${feedbackRowCountPrefix}A11`
  },
  'login-update': {
    batchSize: batchNLarge,
    prompt:
      'using a page explaining a new way to login system for Temporary Disability and Family Leave benefits',
    tabName: 'login-update',
    totalRowsRange: `${feedbackRowCountPrefix}A14`
  },
  basicneeds: {
    batchSize: batchNLarge,
    prompt: 'using the New Jersey Basic Needs Hub',
    tabName: 'basicneeds',
    totalRowsRange: `${feedbackRowCountPrefix}17`
  },
  transgender: {
    batchSize: batchNLarge,
    prompt: 'using the New Jersey Transgender Infomation Hub',
    tabName: 'transgender',
    totalRowsRange: `${feedbackRowCountPrefix}A20`
  }

};

const OLDpflSheetUrls = {
  'Claim detail': {
    batchSize: batchNsmall,
    prompt:
      'after seeing the `Claim detail` page in the Temporary Disability & Family Leave benefits tool',
    tabName: 'claim-detail'
  },
  Other: {
    batchSize: batchNsmall,
    prompt: 'after using the Temporary Disability & Family Leave benefits tool',
    tabName: 'other'
  },
  'Payment detail': {
    batchSize: batchNsmall,
    prompt:
      'after seeing the `Payment detail` page in the Temporary Disability & Family Leave benefits tool',
    tabName: 'payment-detail'
  },
  'Application received': {
    batchSize: batchNsmall,
    prompt:
      'after seeing the `Application Received` page in the Temporary Disability & Family Leave benefits tool',
    tabName: 'application-received'
  },
  'No claim on file': {
    batchSize: batchNsmall,
    prompt:
      'after seeing the `No claim on file` page in the Temporary Disability & Family Leave benefits tool',
    tabName: 'no-claim'
  }
};
