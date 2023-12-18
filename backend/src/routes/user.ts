import { Router } from "express";
import * as userController from "../controllers/userController";
import { authorize } from "../middleware/authenticate";
import { validation } from "../middleware/validation";

export const userRouter = Router()

userRouter.get('/:username', userController.getUser)

const updateUserValidation = validation([{
    property: 'displayName',
    required: false,
    min: 1,
    max: 25
}, {
    property: 'bio',
    required: false,
    max: 180
},]);

userRouter.post('/', authorize, updateUserValidation, userController.updateUser)