import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import type { Request, Response, NextFunction } from "express";
import { User } from "../db/schema";
import { eq } from "drizzle-orm";
import { sleep } from "../lib/sleep";

export async function getUser(req: Request, res: Response, next: NextFunction) {
    const username = req.params.username.toLowerCase();
    const row = await db.query.User.findFirst({
        where(fields, operators) {
            return operators.eq(fields.usernameLower, username)
        },
    })
    if (!row)
        return next(new AppError('No user with that username exists', 404))
    const { passwordHash, emailVerified, usernameLower, email, userId, lastLogin, ...user } = row;
    res.json(user)
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
    const user = res.locals.token!.user;
    const result = await db
        .update(User)
        .set({
            username: req.body.username,
            usernameLower: req.body.username.toLowerCase()
        })
        .where(eq(User.email, user.email))
    if (result.length == 0)
        return next(new AppError("Please logout and login again", 403))
    return res.sendStatus(200)
}