import { Request, Response, NextFunction } from "express";
import { createLogger, transports, format, Logger } from "winston";
import { AppError } from "./app-errors";

const LogErrors: Logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "app_error.log" })
  ]
});

class ErrorLogger {
  async logError(err: any, req?: Request): Promise<boolean> {
    LogErrors.log({
      private: true,
      level: "error",
      message: err.message || "Unknown error",
      timestamp: new Date().toISOString(),
      path: req?.originalUrl,
      method: req?.method,
      stack: err.stack,
      details: err
    });
    return false;
  }

  isTrustError(error: any): boolean {
    return error instanceof AppError && error.isOperational;
  }
}

export const ErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errorLogger = new ErrorLogger();

  process.on("uncaughtException", async (error: any) => {
    await errorLogger.logError(error);
  });

  if (err) {
    await errorLogger.logError(err, req);

    const statusCode = err.statusCode || 500;
    //const isTrusted = errorLogger.isTrustError(err);
    const isTrusted = true


    res.status(statusCode).json({
      status: "error",
      statusCode,
      message: isTrusted ? (err.errorStack || err.message) : "Internal Server Error",
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
      isTrusted
    });

    return;
  }

  next();
};
