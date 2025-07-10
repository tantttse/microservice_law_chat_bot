export const ConversationSchemas = {
  PaginatedResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/ConversationResponseDto' },
        example: [
          {
            id: 1,
            userId: 101,
            title: 'Understanding Traffic Signs',
            createdAt: '2025-06-15T08:30:00Z',
            updatedAt: '2025-06-15T09:00:00Z',
          },
          {
            id: 2,
            userId: 102,
            title: 'Who has the right of way?',
            createdAt: '2025-06-14T10:15:00Z',
            updatedAt: '2025-06-14T10:45:00Z',
          },
        ],
      },
      meta: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 50 },
          page: { type: 'integer', example: 1 },
          lastPage: { type: 'integer', example: 5 },
        },
      },
    },
  },

  CreateConversationDto: {
    type: 'object',
    required: ['userId', 'title'],
    properties: {
      userId: {
        type: 'integer',
        example: 1,
      },
      title: {
        type: 'string',
        example: 'Traffic signal confusion at night',
      },
    },
  },

  UpdateConversationDto: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        example: 'Updated: Traffic lights clarification',
      },
    },
  },

  ConversationResponseDto: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1,
      },
      userId: {
        type: 'integer',
        example: 101,
      },
      title: {
        type: 'string',
        example: 'Understanding right-turn rules',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-06-15T08:30:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2025-06-15T09:00:00Z',
      },
    },
  },
};
