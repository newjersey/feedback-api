export default {
  type: 'object',
  properties: {
    email: { type: 'string' },
    feedbackId: { type: 'number' }
  },
  required: ['email', 'feedbackId']
} as const;
