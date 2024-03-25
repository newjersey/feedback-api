const FEEDBACK_SMALL_BATCH_SIZE = 1100;
const FEEDBACK_LARGE_BATCH_SIZE = 5000;

const FEEDBACK_WIDGET_URLS = {
  'uistatus.dol.state.nj.us': {
    batchSize: FEEDBACK_SMALL_BATCH_SIZE,
    prompt: 'applying for Unimployment Insurance benefits'
  },
  'maternity/timeline-tool': {
    batchSize: FEEDBACK_LARGE_BATCH_SIZE,
    prompt: 'using the Maternity Timeline Tool'
  },
  'claims-status.shtml': {
    batchSize: FEEDBACK_LARGE_BATCH_SIZE,
    prompt:
      'using an FAQ page explaining what happens after applying for Temporary Disability or Family Leave benefits'
  },
  'login-update': {
    batchSize: FEEDBACK_LARGE_BATCH_SIZE,
    prompt:
      'using a page explaining a new way to login system for Temporary Disability and Family Leave benefits'
  },
  transgender: {
    batchSize: FEEDBACK_LARGE_BATCH_SIZE,
    prompt: 'using the New Jersey Transgender Infomation Hub'
  },
  basicneeds: {
    batchSize: FEEDBACK_LARGE_BATCH_SIZE,
    prompt: 'using the New Jersey Basic Needs Hub'
  }
};

const PFL_BATCH_SIZE = 1100;

const PFL_SHEET_URLS = {
  'Claim detail': {
    batchSize: PFL_BATCH_SIZE,
    prompt:
      'after seeing the `Claim detail` page in the Temporary Disability & Family Leave benefits tool'
  },
  Other: {
    batchSize: PFL_BATCH_SIZE,
    prompt: 'after using the Temporary Disability & Family Leave benefits tool'
  },
  'Payment detail': {
    batchSize: PFL_BATCH_SIZE,
    prompt:
      'after seeing the `Payment detail` page in the Temporary Disability & Family Leave benefits tool'
  },
  'Application received': {
    batchSize: PFL_BATCH_SIZE,
    prompt:
      'after seeing the `Application Received` page in the Temporary Disability & Family Leave benefits tool'
  }
};

export const SHEET_CONFIGS = {
  feedbackWidget: {
    sheetId: process.env.SHEET_ID,
    totalRowsRange: 'Metadata!A2',
    sheetName: 'Sheet1',
    urls: FEEDBACK_WIDGET_URLS,
    columnMap: {
      Timestamp: 'A',
      PageURL: 'B',
      Rating: 'C',
      Comment: 'D',
      Email: 'E'
    },
    columnOrder: {
      Timestamp: 0,
      PageURL: 1,
      Rating: 2,
      Comment: 3,
      Email: 4
    }
  },
  pflSheet: {
    sheetId: process.env.PFL_SHEET_ID,
    totalRowsRange: 'Metadata!A2',
    sheetName: 'Results',
    urls: PFL_SHEET_URLS,
    columnMap: {
      ResponseID: 'A',
      Timestamp: 'B',
      PageURL: 'C',
      Rating: 'D',
      Comment: 'E'
    },
    columnOrder: {
      ResponseID: 0,
      Timestamp: 1,
      PageURL: 2,
      Rating: 3,
      Comment: 4
    }
  }
};

