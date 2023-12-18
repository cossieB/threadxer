import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import type { Request, Response, NextFunction } from "express";
import { User } from "../db/schema";
import { eq } from "drizzle-orm";
import { validateUrl } from "../lib/validateUrl";

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
    if (Object.keys(req.body).length === 0)
        return next(new AppError("Empty request body", 400))
    try {
        const user = res.locals.token!.user;
        if (req.body.website && !validateUrl(req.body.website))
            throw new AppError("Please don't bypass client validation", 400)
        const { displayName, bio, website, location, avatar, banner } = req.body;
        
        await db
            .update(User)
            .set({ displayName, bio, website, location, avatar, banner })
            .where(eq(User.email, user.email))
 
        return res.sendStatus(200)
    } 
    catch (error) {
        next(error)
    }
}
