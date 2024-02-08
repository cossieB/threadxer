import express from "express";
import * as postController from '../controllers/postController'
import { authorize } from "../middleware/authenticate";
import { validation } from "../middleware/validation";

export const postRouter = express.Router()

postRouter.get('/', postController.getAllPosts )

postRouter.post('/', authorize, validation([{
    property: 'text',
    min: 1,
    max: 180
}, {
    property: 'media',
    isRequired: false,
    type: 'array'
}]), postController.createPost)

postRouter.get('/:postId', postController.getPost)

postRouter.get('/:postId/replies', postController.getPostReplies)
postRouter.get('/:postId/quotes', postController.getPostQuotes)
postRouter.get('/:postId/likes', postController.getPostLikes)