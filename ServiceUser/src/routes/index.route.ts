import { Router } from "express";
import userRouter from "./user.routes";
import authRouter from "./auth.routes";


const apiRouter = Router();
const API_PREFIX = ""; // Root path - no prefix needed

// Mount the routers under specific paths
apiRouter.use(`/auth`, authRouter);
apiRouter.use(`/users`, userRouter);


export default apiRouter; // Export the aggregated API router
