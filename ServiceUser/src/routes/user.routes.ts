import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const userRouter = Router();
const controller = new UserController();

userRouter.post("/", controller.create);
userRouter.get("/:id", controller.findById);
userRouter.get("/", controller.findAll);
userRouter.put("/:id", controller.update);
userRouter.delete("/:id", controller.delete);

export default userRouter;
