// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { publicRoutes ,AdminRoutes } from "../../config/route.config"; 
import { verifyToken } from "../utils/verifyToken.utils";
import { matchRoute } from "../utils/RegRouteCheck.utils";
import { APIError } from "../errors/app.errors";


export const gatewayAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const path = req.originalUrl.split('?')[0]; 

  if (publicRoutes.includes(path)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = verifyToken(token);
    req.user = user;

    if (matchRoute(path, AdminRoutes)) {
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
    }

    return next();
  } catch (error) {
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
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

  export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader) {
        const token = authHeader.split(" ")[1];
        if (token) {
          const decoded = verifyToken(token);
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