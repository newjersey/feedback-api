export default {
  type: 'object',
  properties: {
    pageURL: { type: 'string' },
    sheet: { type: 'string' }
  },
  required: ['sheet']
} as const;
