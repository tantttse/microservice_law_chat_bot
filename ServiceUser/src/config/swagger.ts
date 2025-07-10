import { Application } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { AllSchemas } from "../models/index";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Traffic Law Conversation API",
      version: "1.0.0",
      description: "API documentation for the Traffic Law Conversation system",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: AllSchemas,
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/controllers/*.ts"],
};

export const setupSwagger = (app: Application) => {
  const specs = swaggerJsdoc(swaggerOptions);
  // @ts-ignore
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
};
