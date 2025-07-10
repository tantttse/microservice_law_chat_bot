import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller";
//import { authMiddleware } from "../middleware/auth.middleware";

const conversationRouter = Router();
const controller = new ConversationController();

// All conversation routes require authentication
//conversationRouter.use(authMiddleware.authenticate);

conversationRouter.post("/", controller.create);
conversationRouter.get("/:id", controller.findById);
conversationRouter.get("/", controller.findAll);
conversationRouter.put("/:id", controller.update);
conversationRouter.delete("/:id", controller.delete);

export default conversationRouter;
