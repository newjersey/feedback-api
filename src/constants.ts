const FEEDBACK_SMALL_BATCH_SIZE = 1100;
const FEEDBACK_LARGE_BATCH_SIZE = 5000;

const FEEDBACK_WIDGET_URLS = {
  'uistatus.dol.state.nj.us': {
    batchSize: FEEDBACK_SMALL_BATCH_SIZE,
    prompt: 'applying for Unimployment Insurance benefits',
    tabName: 'uistatus'

  },
  'maternity/timeline-tool': {
    batchSize: FEEDBACK_LARGE_BATCH_SIZE,
    prompt: 'using the Maternity Timeline Tool',
    tabName: 'maternity-timeline'
  },
  'claims-status.shtml': {
    batchSize: FEEDBACK_LARGE_BATCH_SIZE,
    prompt:
      'using an FAQ page explaining what happens after applying for Temporary Disability or Family Leave benefits',
    tabName: 'claims-status'
  },
  'login-update': {
    batchSize: FEEDBACK_LARGE_BATCH_SIZE,
    prompt:
      'using a page explaining a new way to login system for Temporary Disability and Family Leave benefits',
    tabName: 'login-update'
  },
  transgender: {
    batchSize: FEEDBACK_LARGE_BATCH_SIZE,
    prompt: 'using the New Jersey Transgender Infomation Hub',
    tabName: 'transgender'
  },
  basicneeds: {
    batchSize: FEEDBACK_LARGE_BATCH_SIZE,
    prompt: 'using the New Jersey Basic Needs Hub',
    tabName: 'basicneeds'
  }
};

const PFL_BATCH_SIZE = 1100;

const PFL_SHEET_URLS = {
  'Claim detail': {
    batchSize: PFL_BATCH_SIZE,
    prompt:
      'after seeing the `Claim detail` page in the Temporary Disability & Family Leave benefits tool',
    tabName: 'claim-detail'
  },
  Other: {
    batchSize: PFL_BATCH_SIZE,
    prompt: 'after using the Temporary Disability & Family Leave benefits tool',
    tabName: 'other'
  },
  'Payment detail': {
    batchSize: PFL_BATCH_SIZE,
    prompt:
      'after seeing the `Payment detail` page in the Temporary Disability & Family Leave benefits tool',
    tabName: 'payment-detail'
  },
  'Application received': {
    batchSize: PFL_BATCH_SIZE,
    prompt:
      'after seeing the `Application Received` page in the Temporary Disability & Family Leave benefits tool',
    tabName: 'application-received'
  },
  'No claim on file': {
    batchSize: PFL_BATCH_SIZE,
    prompt:
      'after seeing the `No claim on file` page in the Temporary Disability & Family Leave benefits tool',
    tabName: 'no-claim'
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

