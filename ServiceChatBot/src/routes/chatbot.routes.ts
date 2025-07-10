import { Router } from "express";
import { ChatbotController } from "../controllers/chatbot.controller";
//import { authMiddleware } from "../middleware/auth.middleware";

const chatbotRouter = Router();
const controller = new ChatbotController();

// Public routes (works for both guest and authenticated users)
chatbotRouter.post("/chat", 
  //authMiddleware.optionalAuth, 
  controller.chat);
chatbotRouter.post(
  "/chat/stream",
  //authMiddleware.optionalAuth,
  controller.chatStream
);
chatbotRouter.get("/guest/history", controller.getGuestHistory);

// Protected routes (require authentication)
chatbotRouter.get(
  "/conversations",
  //authMiddleware.authenticate,
  controller.getConversations
);
chatbotRouter.get(
  "/conversations/:conversationId/history",
  //authMiddleware.authenticate,
  controller.getChatHistory
);

export default chatbotRouter;
