import { Router } from "express";
import * as userController from "../controllers/userController";
import { authorize } from "../middleware/authenticate";
import { validation } from "../middleware/validation";

export const userRouter = Router()

userRouter.get('/:username', userController.getUser)

const updateUserValidation = validation([{
    property: 'displayName',
    isRequired: false,
    min: 1,
    max: 25
}, {
    property: 'bio',
    isRequired: false,
    max: 180
},]);

userRouter.post('/', authorize, updateUserValidation, userController.updateUser)
userRouter.get("/:username/posts", userController.getUserPosts)
userRouter.get("/:username/replies", userController.getUserReplies)
userRouter.get("/:username/likes", userController.getUserLikes)
userRouter.get("/:username/media", userController.getUserMedia)
