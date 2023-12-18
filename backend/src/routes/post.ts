import express from "express";
import * as postController from '../controllers/postController'
import { authorize } from "../middleware/authenticate";
import { validation } from "../middleware/validation";

export const postRouter = express.Router()

postRouter.get('/', postController.getAllPosts )

postRouter.get('/:postId', postController.getPost)

postRouter.post('/', authorize, validation([{
    property: 'text',
    min: 1,
    max: 180
}]), postController.createPost)