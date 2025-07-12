import express, { Application } from "express";
import cors from "cors";
import { ErrorHandler } from "./common/errors/error-handler";
import apiRouter from "./routes/index.route";
import { setupSwagger } from "./config/swagger";
import path from "path";

export default async (app: Application): Promise<void> => {
  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(express.static(__dirname + "/public")); // Serving static files

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "OK",
      message: "Vietnamese Traffic Law Chatbot API is running",
      timestamp: new Date().toISOString(),
      endpoints: {
        "API Documentation": "/docs",
        "Test Client": "/test-client",
        "API Base": "/",
      },
    });
  });

  // Serve the HTML test client at /test-client
  app.get("/test-client", (req, res) => {
    res.sendFile(path.join(process.cwd(), "api-test-client.html"));
  });

  // Setup Swagger
  setupSwagger(app);

  // API Routes (mounted at root)
  app.use(apiRouter);

  // Error handling
  app.use(ErrorHandler);
};
