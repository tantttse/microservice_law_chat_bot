export const DocumentSchemas = {
  CreateDocumentDto: {
    type: "object",
    required: ["title"],
    properties: {
      title: {
        type: "string",
        example: "Vietnamese Traffic Law 2024",
      },
      description: {
        type: "string",
        example: "Complete traffic law regulations for Vietnam",
      },
    },
  },

  UpdateDocumentDto: {
    type: "object",
    properties: {
      title: {
        type: "string",
        example: "Updated Traffic Law 2024",
      },
      description: {
        type: "string",
        example: "Updated description",
      },
      isActive: {
        type: "boolean",
        example: true,
      },
    },
  },

  DocumentResponseDto: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      title: {
        type: "string",
        example: "Vietnamese Traffic Law 2024",
      },
      filename: {
        type: "string",
        description: "UUID-based filename on disk",
        example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890.docx",
      },
      originalFilename: {
        type: "string",
        description: "Original filename from upload",
        example: "traffic-law.docx",
      },
      path: {
        type: "string",
        example: "/uploads/documents/a1b2c3d4-e5f6-7890-abcd-ef1234567890.docx",
      },
      type: {
        type: "string",
        enum: ["txt", "docx"],
        example: "docx",
      },
      size: {
        type: "integer",
        example: 2048576,
      },
      isActive: {
        type: "boolean",
        example: true,
      },
      description: {
        type: "string",
        example: "Complete traffic law regulations for Vietnam",
      },
      uploadedBy: {
        type: "integer",
        example: 1,
      },
      uploader: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          firstName: {
            type: "string",
            example: "John",
          },
          lastName: {
            type: "string",
            example: "Doe",
          },
          email: {
            type: "string",
            example: "admin@example.com",
          },
        },
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2025-07-03T10:00:00Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2025-07-03T10:30:00Z",
      },
    },
  },

  SetActiveDocumentsDto: {
    type: "object",
    required: ["documentIds"],
    properties: {
      documentIds: {
        type: "array",
        items: {
          type: "integer",
        },
        example: [1, 2, 3],
      },
    },
  },

  DocumentListResponseDto: {
    type: "object",
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/DocumentResponseDto" },
      },
      meta: {
        type: "object",
        properties: {
          total: { type: "integer", example: 10 },
          page: { type: "integer", example: 1 },
          lastPage: { type: "integer", example: 3 },
          hasNextPage: { type: "boolean", example: true },
          hasPreviousPage: { type: "boolean", example: false },
        },
      },
    },
  },
};
