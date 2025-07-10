export const MessageSchemas = {
  CreateMessageDto: {
    type: 'object',
    required: ['question', 'answer', 'conversationId'],
    properties: {
      question: {
        type: 'string',
        example: 'What is the speed limit in residential areas?',
      },
      answer: {
        type: 'string',
        example: 'In most cities, the speed limit in residential areas is 30 km/h.',
      },
      conversationId: {
        type: 'integer',
        example: 1,
      },
    },
  },

  UpdateMessageDto: {
    type: 'object',
    properties: {
      question: {
        type: 'string',
        example: 'What’s the updated speed limit for school zones?',
      },
      answer: {
        type: 'string',
        example: 'School zones typically have a speed limit of 20 km/h during school hours.',
      },
    },
  },

  MessageResponseDto: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 10,
      },
      question: {
        type: 'string',
        example: 'Is it legal to park in front of a fire hydrant?',
      },
      answer: {
        type: 'string',
        example: 'No, parking in front of a fire hydrant is prohibited for safety reasons.',
      },
      conversationId: {
        type: 'integer',
        example: 2,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-06-15T14:45:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-06-15T15:00:00Z',
      },
    },
  },
};
