export default {
  type: 'object',
  properties: {
    pageURL: { type: 'string' },
    sheet: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' }
  },
  required: ['sheet', 'pageURL']
} as const;
