export default {
  type: 'object',
  properties: {
    pageURL: { type: 'string' },
    rating: { type: 'boolean' }
  },
  required: ['pageURL', 'rating']
} as const;
