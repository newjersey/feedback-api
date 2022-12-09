export default {
  type: 'object',
  properties: {
    comment: { type: 'string' },
    feedbackId: { type: 'number' }
  },
  required: ['comment', 'feedbackId']
} as const;
