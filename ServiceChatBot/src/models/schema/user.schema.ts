export const UserSchemas = {
  CreateUserDto: {
    type: "object",
    required: ["email", "firstName", "lastName", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "john.doe@example.com",
      },
      firstName: {
        type: "string",
        example: "John",
      },
      lastName: {
        type: "string",
        example: "Doe",
      },
      password: {
        type: "string",
        example: "securePassword123",
      },
      isActive: {
        type: "boolean",
        example: true,
      },
    },
  },

  UpdateUserDto: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "updated.email@example.com",
      },
      firstName: {
        type: "string",
        example: "UpdatedFirst",
      },
      lastName: {
        type: "string",
        example: "UpdatedLast",
      },
      isActive: {
        type: "boolean",
        example: false,
      },
      isAdmin: {
        type: "boolean",
        example: true,
      },
    },
  },

  UserResponseDto: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      email: {
        type: "string",
        format: "email",
        example: "john.doe@example.com",
      },
      firstName: {
        type: "string",
        example: "John",
      },
      lastName: {
        type: "string",
        example: "Doe",
      },
      isAdmin: {
        type: "boolean",
        example: false,
      },
      isActive: {
        type: "boolean",
        example: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2025-06-15T14:45:00Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2025-06-15T15:00:00Z",
      },
    },
  },
};
