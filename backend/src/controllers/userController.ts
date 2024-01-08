import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import type { Request, Response, NextFunction } from "express";
import { Post, Repost, User } from "../db/schema";
import { and, eq, isNull, inArray, or, desc, sql } from "drizzle-orm";
import { validateUrl } from "../lib/validateUrl";
import { getPosts } from "../models/getPosts";

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
            .where(eq(User.userId, user.userId))

        return res.sendStatus(200)
    }
    catch (error) {
        next(error)
    }
}

export async function getUserPosts(req: Request, res: Response, next: NextFunction) {
    const currentUser = res.locals.token?.user
    const username = req.params.username.toLowerCase()
    const subquery = db.select({ postId: Repost.postId })
        .from(Repost)
        .innerJoin(User, eq(User.userId, Repost.userId))
        .where(eq(User.usernameLower, username))
        .orderBy(desc(Repost.dateCreated))
        .limit(100)
        
    const query = getPosts(res, true)
    if (!currentUser)
        query.leftJoin(Repost, eq(Post.postId, Repost.postId))
    query
        .orderBy(desc(sql<Date>`COALESCE(${Repost.dateCreated}, ${Post.dateCreated})`))
        .where(
            or(
                and(
                    eq(User.usernameLower, username),
                    isNull(Post.replyTo)
                ),
                inArray(Post.postId, subquery)
            )
        )

    const posts = await query

    res.json(
        posts.map(p => {
            const { originalPost, originalPostAuthor, quoteAuthor, quotePost, ...x } = p
            return {
                ...x,
                ...originalPost?.postId && { originalPost, originalPostAuthor },
                ...quotePost?.postId && { quotePost, quoteAuthor },
            }
        })
    )
}