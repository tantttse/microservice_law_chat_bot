import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../services/auth.service";
import { APIError } from "../errors/app-errors";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        isAdmin: boolean;
      };
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Middleware to verify JWT token
  authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new APIError("NO_TOKEN", 401, "Access token is required");
      }

      const token = authHeader.split(" ")[1]; // Bearer <token>

      if (!token) {
        throw new APIError("INVALID_TOKEN_FORMAT", 401, "Invalid token format");
      }

      // Verify token
      const decoded = this.authService.verifyToken(token);

      // Add user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        isAdmin: decoded.isAdmin,
      };

      next();
    } catch (error) {
      if (error instanceof APIError) {
        return res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
      }

      return res.status(401).json({
        status: "error",
        message: "Invalid or expired token",
      });
    }
  };

  // Middleware to check if user is admin
  requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    // This middleware should be used after authenticate middleware
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Admin access required",
      });
    }

    next();
  };

  // Optional authentication - doesn't fail if no token
  optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader) {
        const token = authHeader.split(" ")[1];
        if (token) {
          const decoded = this.authService.verifyToken(token);
          req.user = {
            userId: decoded.userId,
            email: decoded.email,
            isAdmin: decoded.isAdmin,
          };
        }
      }

      next();
    } catch (error) {
      // Continue without authentication if token is invalid
      next();
    }
  };
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();
