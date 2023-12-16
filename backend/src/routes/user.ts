import { Router } from "express";
import * as userController from "../controllers/userController";
import { authorize } from "../middleware/authenticate";
import { validation } from "../middleware/validation";

export const userRouter = Router()

userRouter.get('/:username', userController.getUser)
userRouter.post('/', authorize, validation(['displayName']), userController.updateUser)