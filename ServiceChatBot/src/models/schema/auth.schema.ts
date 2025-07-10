export const AuthSchemas = {
  LoginDto: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "user@example.com",
      },
      password: {
        type: "string",
        example: "password123",
      },
    },
  },

  RegisterDto: {
    type: "object",
    required: ["email", "password", "firstName", "lastName"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "newuser@example.com",
      },
      password: {
        type: "string",
        example: "password123",
      },
      firstName: {
        type: "string",
        example: "John",
      },
      lastName: {
        type: "string",
        example: "Doe",
      },
    },
  },

  AuthResponseDto: {
    type: "object",
    properties: {
      user: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
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
        },
      },
      token: {
        type: "string",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
      message: {
        type: "string",
        example: "Login successful",
      },
    },
  },

  ChangePasswordDto: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    properties: {
      currentPassword: {
        type: "string",
        example: "oldpassword123",
      },
      newPassword: {
        type: "string",
        example: "newpassword123",
      },
    },
  },

  UpdateProfileDto: {
    type: "object",
    properties: {
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
        format: "email",
        example: "newemail@example.com",
      },
    },
  },
};
