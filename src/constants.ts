const FEEDBACK_WIDGET_URLS = {
  'uistatus.dol.state.nj.us': {
    prompt: 'applying for Unimployment Insurance benefits'
  },
  'maternity/timeline-tool': {
    prompt: 'using the Maternity Timeline Tool'
  },
  'claims-status.shtml': {
    prompt:
      'using an FAQ page explaining what happens after applying for Temporary Disability or Family Leave benefits'
  },
  'login-update': {
    prompt:
      'using a page explaining a new way to login system for Temporary Disability and Family Leave benefits'
  },
  transgender: { prompt: 'using the New Jersey Transgender Infomation Hub' },
  basicneeds: { prompt: 'using the New Jersey Basic Needs Hub' }
};

const PFL_SHEET_URLS = {
  'Claim detail': {
    prompt:
      'after seeing the `Claim detail` page in the Temporary Disability & Family Leave benefits tool'
  },
  Other: {
    prompt: 'after using the Temporary Disability & Family Leave benefits tool'
  },
  'Payment detail': {
    prompt:
      'after seeing the `Payment detail` page in the Temporary Disability & Family Leave benefits tool'
  },
  'Application received': {
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

