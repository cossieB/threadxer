import express from "express";
import { rateLimiter } from "../middleware/rateLimiter";
import * as repostController from "../controllers/repostController";
import { authorize } from "../middleware/authenticate";

export const repostRouter = express.Router()

repostRouter.post('/:postId', authorize, rateLimiter('like', 10, 60), repostController.repost)