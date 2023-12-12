import { Router } from "express";
import * as userController from "../controllers/userController";
import { authorize } from "../middleware/authenticate";

export const userRouter = Router()

userRouter.get('/:username', userController.getUser)
userRouter.post('/', authorize, userController.updateUser)