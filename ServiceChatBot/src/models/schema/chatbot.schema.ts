export const ChatbotSchemas = {
  ChatRequestDto: {
    type: "object",
    required: ["message"],
    properties: {
      message: {
        type: "string",
        minLength: 1,
        maxLength: 1000,
        example: "What is the speed limit on highways in Vietnam?",
      },
      conversationId: {
        type: "integer",
        example: 1,
        description:
          "Only for authenticated users to continue existing conversation",
      },
      isGuest: {
        type: "boolean",
        example: false,
        description: "Whether this is a guest user (temporary conversation)",
      },
    },
  },

  ChatResponseDto: {
    type: "object",
    properties: {
      response: {
        type: "string",
        example:
          "In Vietnam, the speed limit on highways is typically 120 km/h for cars and 90 km/h for motorcycles, according to Decree 15/2020/ND-CP.",
      },
      conversationId: {
        type: "integer",
        example: 1,
        nullable: true,
        description: "Conversation ID (null for guest users)",
      },
      messageId: {
        type: "integer",
        example: 5,
        nullable: true,
        description: "Message ID (null for guest users)",
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-06-28T10:30:00Z",
      },
      isGuest: {
        type: "boolean",
        example: false,
        description: "Whether this was a guest conversation",
      },
    },
  },

  PaginationMeta: {
    type: "object",
    properties: {
      total: {
        type: "integer",
        example: 50,
      },
      page: {
        type: "integer",
        example: 1,
      },
      lastPage: {
        type: "integer",
        example: 5,
      },
      hasNextPage: {
        type: "boolean",
        example: true,
      },
      hasPreviousPage: {
        type: "boolean",
        example: false,
      },
    },
  },

  GuestHistoryResponse: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "guest_0",
            },
            question: {
              type: "string",
              example: "What is the speed limit?",
            },
            answer: {
              type: "string",
              example: "The speed limit varies by road type...",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-28T10:30:00Z",
            },
          },
        },
      },
      meta: {
        type: "object",
        properties: {
          total: {
            type: "integer",
            example: 1,
          },
          isGuest: {
            type: "boolean",
            example: true,
          },
          conversationId: {
            type: "string",
            example: "guest_123456",
          },
        },
      },
    },
  },
};
