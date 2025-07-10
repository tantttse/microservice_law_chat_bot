import { Router } from "express";
import { MessageController } from "../controllers/messages.controller";

const messagesRouter = Router();
const controller = new MessageController();

// All message routes require authentication
//messagesRouter.use(authMiddleware.authenticate);

messagesRouter.post("/", controller.create);
messagesRouter.get("/:id", controller.findById);
messagesRouter.get("/", controller.findAll);
messagesRouter.put("/:id", controller.update);
messagesRouter.delete("/:id", controller.delete);

export default messagesRouter;
