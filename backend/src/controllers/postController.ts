import type { Request, Response, NextFunction } from "express";
import { db } from "../db/drizzle";
import { Hashtags, Likes, Media, Post, Repost, User } from "../db/schema";
import AppError from "../utils/AppError";
import { and, count, eq, desc, isNull, sql } from "drizzle-orm";
import { getHashtags } from "../utils/getHashtags";
import { alias } from "drizzle-orm/pg-core";
import { getPosts } from "../models/getPosts";

export async function createPost(req: Request, res: Response, next: NextFunction) {
    const user = res.locals.token!.user
    const { text } = req.body as { text: string, media?: string[] }
    const media: string[] = req.body.media ?? []
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
                await tx.insert(Media).values(media.map(url => ({
                    postId: row[0].postId,
                    url
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

    const query = getPosts(res)
    query.where(eq(Post.postId, postId))

    const posts = await query
    const post = posts.at(0);
    if (!post)
        return next(new AppError("That post doesn't exist", 404))
    if (!post.quotePost?.postId){
        //@ts-expect-error
        delete post.quotedPost; delete post.quoteAuthor
    }
    if (!post.originalPost?.postId){
        //@ts-expect-error
        delete post.originalPost; delete post.originalPostAuthor
    }
    return res.json(post)
}

export async function getAllPosts(req: Request, res: Response, next: NextFunction) {
    const page = Number(req.body.page) || 0
    const postsPerPage = 100
    const query = getPosts(res);
    query
        .where(and(isNull(Post.replyTo)))
        .limit(postsPerPage)
        .offset(page * postsPerPage)
        .orderBy(desc(Post.dateCreated));
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


