import type { Request, Response, NextFunction } from "express";
import { db } from "../db/drizzle";
import { Likes } from "../db/schema";
import { PostgresError } from "postgres";
import AppError from "../utils/AppError";
import { eq } from "drizzle-orm";

export async function likePost(req: Request, res: Response, next: NextFunction) {
    const user = res.locals.token!.user;
    console.log(req.params)

    try {
        await db.insert(Likes).values({
            postId: req.params.postId,
            userId: user.userId
        })
        return res.sendStatus(201)
    }
    catch (error: unknown) {
        if (error instanceof PostgresError) {
            if (error.message.includes("likes_post_id_user_id_unique")) {
                await db.delete(Likes).where(eq(Likes.postId, req.params.postId))
                return res.sendStatus(200)
            }
        }
        next(error)
    }
}