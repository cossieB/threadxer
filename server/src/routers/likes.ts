import express from "express";
import { rateLimiter } from "../middleware/rateLimiter";
import * as likeController from "../controllers/likeController";
import { authorize } from "../middleware/authenticate";

export const likeRouter = express.Router()

likeRouter.post('/:postId', authorize, rateLimiter('like', 10, 60), likeController.likePost)