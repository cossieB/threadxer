import type { Request, Response, NextFunction } from "express";
import { db } from "../db/drizzle";
import { Hashtags, Likes, Media, Post, User } from "../db/schema";
import AppError from "../utils/AppError";
import { eq, desc, isNull } from "drizzle-orm";
import { getHashtags } from "../utils/getHashtags";
import { getPosts } from "../models/getPosts";
import { formatPosts } from "../utils/formatPosts";
import { PostgresError } from "postgres";
import { postRepliesQuery } from "../models/postRepliesQuery";

export async function createPost(req: Request, res: Response, next: NextFunction) {
    type Body = {
        text: string;
        replyTo?: string | undefined;
        quotedPost?: string | undefined;
        media: {
            url: string;
            isVideo: boolean;
            ref: string;
        }[]
    }
    const user = res.locals.token!.user
    const { text } = req.body as Body
    const media = (req.body as Body).media ?? []
    
    if (text.length + media.length === 0)
        return next(new AppError("Empty posts are not allowed", 400))

    const uniques = getHashtags(text);

    try {
        const postId = await db.transaction(async tx => {
            const row = await tx.insert(Post)
                .values({
                    userId: user.userId,
                    text: text.trim(),
                    quotedPost: req.body.quotedPost,
                    didQuote: !!req.body.quotedPost,
                    replyTo: req.body.replyTo,
                    didReply: !!req.body.replyTo
                }).returning({
                    postId: Post.postId
                })
            if (media.length > 0)
                await tx.insert(Media).values(media.map(m => ({
                    postId: row[0].postId,
                    url: m.url,
                    firebaseRef: m.ref,
                    isVideo: m.isVideo,
                })))
            if (uniques.length > 0)
                await tx.insert(Hashtags).values(uniques.map(tag => ({
                    hashtag: tag,
                    postId: row[0].postId,
                })))
            return row[0].postId
        })
        return res.json({ postId })
    }
    catch (error) {
        next(error)
    }
    res.sendStatus(201)
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
    const { postId } = req.params;

    try {
        const query = getPosts(res)
        query.where(eq(Post.postId, postId))

        const posts = await query
        const post = posts.at(0);
        if (!post)
            return next(new AppError("That post doesn't exist", 404))
        if (!post.quotePost?.postId) {
            //@ts-expect-error
            delete post.quotedPost; delete post.quoteAuthor
        }
        if (!post.originalPost?.postId) {
            //@ts-expect-error
            delete post.originalPost; delete post.originalPostAuthor
        }
        return res.json(post)
    }
    catch (error) {
        if (error instanceof PostgresError && error.message.includes("invalid input syntax for type uuid"))
            return next(new AppError("That post doesn't exist", 404))
        return next(error)
    }
}

export async function getAllPosts(req: Request, res: Response, next: NextFunction) {
    const page = Number(req.body.page) || 0
    const postsPerPage = 100
    const query = getPosts(res);
    query
        .where(isNull(Post.replyTo))
        .limit(postsPerPage)
        .offset(page * postsPerPage)
        .orderBy(desc(Post.dateCreated));
    const posts = await query

    res.json(posts.map(formatPosts))
}

export async function getPostReplies(req: Request, res: Response, next: NextFunction) {
    try {
        const query = postRepliesQuery(res)
        query
            .where(eq(Post.replyTo, req.params.postId))
            .orderBy(desc(Post.dateCreated))

        const posts = await query;
        res.json(posts.map(formatPosts))
    }
    catch (error) {
        if (error instanceof PostgresError && error.message.includes("invalid input syntax for type uuid"))
            return next(new AppError("That post doesn't exist", 404))
        return next(error)
    }
}

export async function getPostQuotes(req: Request, res: Response, next: NextFunction) {
    try {
        const query = postRepliesQuery(res)
        query
            .where(eq(Post.quotedPost, req.params.postId))
            .orderBy(desc(Post.dateCreated))

        const posts = await query;
        res.json(posts.map(formatPosts))
    }
    catch (error) {
        if (error instanceof PostgresError && error.message.includes("invalid input syntax for type uuid"))
            return next(new AppError("That post doesn't exist", 404))
        return next(error)
    }
}

export async function getPostLikes(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId
    try {
        const users = await db.select({
            userId: User.userId,
            username: User.username,
            avatar: User.avatar,
            banner: User.avatar,
            displayName: User.displayName,
            bio: User.bio
        })
            .from(Likes)
            .innerJoin(User, eq(Likes.userId, User.userId))
            .where(eq(Likes.postId, postId))
        return res.json(users)
    }
    catch (error) {
        if (error instanceof PostgresError && error.message.includes("invalid input syntax for type uuid"))
            return next(new AppError("That post doesn't exist", 404))
        return next(error)
    }
}