import { Router } from "express";
import conversationRouter from "./conversation.route";
import messagesRouter from "./messages.route";
import chatbotRouter from "./chatbot.routes";
import documentRouter from "./document.routes";

const apiRouter = Router();

// Mount the routers under specific paths
apiRouter.use(`/chatbot`, chatbotRouter);
apiRouter.use(`/conversations`, conversationRouter);
apiRouter.use(`/messages`, messagesRouter);
apiRouter.use(`/documents`, documentRouter);

// Add other feature routes here as your application grows
// apiRouter.use(`${API_PREFIX}/products`, productRoutes);
// apiRouter.use(`${API_PREFIX}/orders`, orderRoutes);

export default apiRouter; // Export the aggregated API router
