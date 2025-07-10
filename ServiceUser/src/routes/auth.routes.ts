import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../common/middleware/auth.middleware";

const authRouter = Router();
const controller = new AuthController();

// Public routes
authRouter.post("/register", controller.register);
authRouter.post("/login", controller.login);

// Protected routes (require authentication)
authRouter.get("/profile", authMiddleware.authenticate, controller.getProfile);
authRouter.put(
  "/profile",
  authMiddleware.authenticate,
  controller.updateProfile
);
authRouter.post(
  "/change-password",
  authMiddleware.authenticate,
  controller.changePassword
);
authRouter.post("/logout", authMiddleware.authenticate, controller.logout);

export default authRouter;
