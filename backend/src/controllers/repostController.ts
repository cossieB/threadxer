import type { Request, Response, NextFunction } from "express";
import { db } from "../db/drizzle";
import { Repost } from "../db/schema";
import { PostgresError } from "postgres";
import AppError from "../utils/AppError";
import { eq } from "drizzle-orm";

export async function repost(req: Request, res: Response, next: NextFunction) {
    const user = res.locals.token!.user;

    try {
        await db.insert(Repost).values({
            postId: req.params.postId,
            userId: user.userId
        })
        return res.sendStatus(201)
    }
    catch (error: unknown) {
        if (error instanceof PostgresError) {
            if (error.message.includes("unique")) {
                await db.delete(Repost).where(eq(Repost.postId, req.params.postId))
                return res.sendStatus(200)
            }
        }
        next(error)
    }
}