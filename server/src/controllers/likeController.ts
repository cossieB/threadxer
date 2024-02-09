import type { Request, Response, NextFunction } from "express";
import { db } from "../db/drizzle";
import { Likes } from "../db/schema";
import { PostgresError } from "postgres";
import AppError from "../utils/AppError";
import { eq } from "drizzle-orm";

export async function likePost(req: Request, res: Response, next: NextFunction) {
    const user = res.locals.token!.user;


}