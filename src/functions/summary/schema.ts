export default {
  type: 'object',
  properties: {
    pageURL: { type: 'string' },
    sheet: { type: 'string' }
  },
  required: ['pageURL']
} as const;
