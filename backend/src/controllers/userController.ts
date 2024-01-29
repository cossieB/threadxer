import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import type { Request, Response, NextFunction } from "express";
import { Post, RefreshTokens, User } from "../db/schema";
import { and, eq, desc, isNotNull } from "drizzle-orm";
import { validateUrl } from "../lib/validateUrl";
import { getPosts } from "../models/getPosts";
import { getPostsAndReposts } from "../models/getPostsAndReposts";
import { getLikes } from "../models/getLikes";
import { formatPosts } from "../utils/formatPosts";
import { handleTokens } from "../utils/generateCookies";
import jwt, { type JwtPayload } from "jsonwebtoken";

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

    const refresh = req.cookies.rf;
    const token = jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;

    try {
        const user = res.locals.token!.user;
        if (req.body.website && !validateUrl(req.body.website))
            throw new AppError("Please don't bypass client validation", 400)
        const { displayName, bio, website, location, avatar, banner } = req.body;

        const { accessToken, cookie, fb } = await handleTokens({...token.user, displayName, bio, website, location, avatar, banner }, async refreshToken => {
            await db.transaction(async tx => {
                await tx.delete(RefreshTokens).where(eq(RefreshTokens.token, refresh))
                await tx.insert(RefreshTokens).values({
                    token: refreshToken,
                    userId: token.user.userId
                })
                await tx
                    .update(User)
                    .set({ displayName, bio, website, location, avatar, banner })
                    .where(eq(User.userId, user.userId))
            })
        })
        res.setHeader('Set-Cookie', cookie)
        return res.json({ jwt: accessToken, fb })
    }
    catch (error) {
        next(error)
    }
}

export async function getUserPosts(req: Request, res: Response, next: NextFunction) {
    const currentUser = res.locals.token?.user
    const username = req.params.username.toLowerCase()

    const query = getPostsAndReposts(currentUser, username)

    const posts = await query;
    res.json(posts.map(formatPosts))
}

export async function getUserReplies(req: Request, res: Response, next: NextFunction) {
    const page = Number(req.body.page) || 0
    const postsPerPage = 100
    const query = getPosts(res);
    query
        .where(
            and(
                isNotNull(Post.replyTo),
                eq(User.usernameLower, req.params.username.toLowerCase())
            )
        ).limit(postsPerPage)
        .offset(page * postsPerPage)
        .orderBy(desc(Post.dateCreated));

    const posts = await query
    res.json(posts.map(formatPosts))
}

export async function getUserLikes(req: Request, res: Response, next: NextFunction) {
    const { username } = req.params;
    const currentUser = res.locals.token?.user
    const posts = await getLikes(username, currentUser);
    res.json(posts.map(formatPosts))
}