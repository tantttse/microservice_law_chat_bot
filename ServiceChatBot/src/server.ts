import "reflect-metadata";
import express from "express";
import expressApp from "./app";
import dotenv from "dotenv";
dotenv.config();

const StartServer = async () => {
  const app = express();
  await expressApp(app);

  // Create initial admin user
  // try {
  //   await AdminSeeder.createInitialAdmin();
  // } catch (error) {
  //   console.warn("⚠️  Warning: Could not create initial admin user:", error);
  // }

  const port = process.env.PORT || 3000;

  // Handle server startup more gracefully
  try {
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${port} is already in use. Please make sure no other instance is running, or use a different port.`
        );
      } else {
        console.error("Server error:", err.message);
      }
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received. Closing server...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT signal received. Closing server...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

StartServer().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});
