export default {
  type: 'object',
  properties: {
    comment: { type: 'string' },
    feedbackId: { type: 'number' },
    pageURL: { type: 'string' },
    rating: { type: 'boolean' }
  },
  required: ['comment']
} as const;
