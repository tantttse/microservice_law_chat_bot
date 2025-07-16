// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { publicRoutes, AdminRoutes } from "../../config/route.config";
import { verifyToken ,extractToken } from "../utils/verifyToken.utils";
import { matchRoute } from "../utils/RegRouteCheck.utils";
import { APIError } from "../errors/app.errors";

export const gatewayAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const path = req.originalUrl.split("?")[0];
  console.log(
    `gatewayAuthMiddleware - Path: ${path}, Is public route: ${publicRoutes.includes(
      path
    )}`
  );
  const token =extractToken(req.headers.authorization);
  const authHeader = req.headers.authorization;

  if (publicRoutes.includes(path)) {
    console.log(`gatewayAuthMiddleware - Public route detected`);
    if (token) {
      try {
        const user = verifyToken(token);
        console.log(`gatewayAuthMiddleware - Decoded user from token:`, user);
        req.user = user;
        console.log(`gatewayAuthMiddleware - req.user set:`, req.user);

        if (matchRoute(path, AdminRoutes)) {
          console.log(
            `gatewayAuthMiddleware - Admin route detected, isAdmin: ${user.isAdmin}`
          );
          if (!user.isAdmin) {
            console.log(
              `gatewayAuthMiddleware - User is not admin, access denied`
            );
            return res.status(403).json({ message: "Admin access required" });
          }
        }

        console.log(`gatewayAuthMiddleware - Proceeding to next middleware`);
        return next();
      } catch (error) {
        console.log(
          `gatewayAuthMiddleware - Token verification failed:`,
          error
        );
        if (error) {
          return next();
        }
        return res.status(401).json({ message: "Unauthorized" });
      }
    }
    return next();
  }

  console.log(`gatewayAuthMiddleware - Authorization header: ${authHeader}`);

  if (!token) {
    console.log(`gatewayAuthMiddleware - No valid Bearer token provided`);
    return res.status(401).json({ message: "No token provided" });
  }

  console.log(`gatewayAuthMiddleware - Extracted token: ${token}`);

  try {
    const user = verifyToken(token);
    console.log(`gatewayAuthMiddleware - Decoded user from token:`, user);
    req.user = user;
    console.log(`gatewayAuthMiddleware - req.user set:`, req.user);

    if (matchRoute(path, AdminRoutes)) {
      console.log(
        `gatewayAuthMiddleware - Admin route detected, isAdmin: ${user.isAdmin}`
      );
      if (!user.isAdmin) {
        console.log(`gatewayAuthMiddleware - User is not admin, access denied`);
        return res.status(403).json({ message: "Admin access required" });
      }
    }

    console.log(`gatewayAuthMiddleware - Proceeding to next middleware`);
    return next();
  } catch (error) {
    console.log(`gatewayAuthMiddleware - Token verification failed:`, error);
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
