import type { Request, Response, NextFunction } from "express";
import { db } from "../db/drizzle";
import { Hashtags, Likes, Media, Post, Repost, User } from "../db/schema";
import AppError from "../utils/AppError";
import { and, count, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { getHashtags } from "../utils/getHashtags";
import { alias } from "drizzle-orm/pg-core";

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
    const currentUser = res.locals.token?.user

    const likeQ = db.$with('l').as(
        db.select({
            postId: Likes.postId,
            c: count().as('like_count'),
        })
            .from(Likes)
            .groupBy(Likes.postId)
    )
    const repostQ = db.$with('r').as(
        db.select({
            postId: Repost.postId,
            c: count().as('repost_count')
        })
            .from(Repost)
            .groupBy(Repost.postId)
    )
    const quote = alias(Post, 'q')
    const quoteAuthor = alias(User, 'qa')
    const originalPost = alias(Post, 'op')
    const originalPostAuthor = alias(User, 'opa')

    const query = db.with(likeQ, repostQ).select({
        post: {
            ...Post,
            likes: sql<number>`COALESCE (${likeQ.c}::INT, 0)`,
            reposts: sql<number>`COALESCE (${repostQ.c}::INT, 0)`,
        },
        user: {
            userId: User.userId,
            username: User.username,
            avatar: User.avatar,
            banner: User.avatar,
            displayName: User.displayName
        },
        quotedPost: {
            ...quote,
            userId: quoteAuthor.userId,
            username: quoteAuthor.username,
            avatar: quoteAuthor.avatar,
            banner: quoteAuthor.avatar,
            displayName: quoteAuthor.displayName
        },
        replyingTo: {
            ...originalPost,
            userId: originalPostAuthor.userId,
            username: originalPostAuthor.username,
            avatar: originalPostAuthor.avatar,
            banner: originalPostAuthor.avatar,
            displayName: originalPostAuthor.displayName
        },
        ...currentUser && ({
            liked: isNotNull(Likes.userId),
            reposted: isNotNull(Repost.userId)
        }),
    })
        .from(Post)
        .innerJoin(User, eq(User.userId, Post.userId))
        .leftJoin(likeQ, eq(Post.postId, likeQ.postId))
        .leftJoin(repostQ, eq(Post.postId, repostQ.postId))
        .leftJoin(quote, eq(quote.postId, Post.quotedPost))
        .leftJoin(quoteAuthor, eq(quote.userId, quoteAuthor.userId))
        .leftJoin(originalPost, eq(originalPost.postId, Post.replyTo))
        .leftJoin(originalPostAuthor, eq(originalPost.userId, originalPostAuthor.userId))
        .where(eq(Post.postId, postId))

    if (currentUser) {
        query.leftJoin(Likes, and(eq(Post.postId, Likes.postId), eq(Likes.userId, currentUser?.userId)))
        query.leftJoin(Repost, and(eq(Post.postId, Repost.postId), eq(Repost.userId, currentUser?.userId)))
    }

    const posts = await query
    const post = posts.at(0); console.log(post)
    if (!post)
        return next(new AppError("That post doesn't exist", 404))
    if (!post.quotedPost?.postId)
        //@ts-expect-error
        delete post.quotedPost
    if (!post.replyingTo?.postId)
        //@ts-expect-error
        delete post.replyingTo
    return res.json(post)
}

export async function getAllPosts(req: Request, res: Response, next: NextFunction) {
    const currentUser = res.locals.token?.user
    // if (currentUser) {
    //     const subquery = db.select({
    //         followeeId: FollowerFollowee.followeeId
    //     })
    //     .from(FollowerFollowee)
    //     .where(eq(FollowerFollowee.followerId, currentUser.userId))
    //     .as('sub')
    // }
    const likeQ = db.$with('l').as(
        db.select({
            postId: Likes.postId,
            c: count().as('like_count'),
        })
            .from(Likes)
            .groupBy(Likes.postId)
    )
    const repostQ = db.$with('r').as(
        db.select({
            postId: Repost.postId,
            c: count().as('repost_count')
        })
            .from(Repost)
            .groupBy(Repost.postId)
    )
    const quote = alias(Post, 'q')
    const quoteAuthor = alias(User, 'qa')
    const originalPost = alias(Post, 'op')
    const originalPostAuthor = alias(User, 'opa')
    const query = db.with(likeQ, repostQ).select({
        post: {
            ...Post,
            likes: sql<number>`COALESCE (${likeQ.c}::INT, 0)`,
            reposts: sql<number>`COALESCE (${repostQ.c}::INT, 0)`,
        },
        user: {
            userId: User.userId,
            username: User.username,
            avatar: User.avatar,
            banner: User.avatar,
            displayName: User.displayName
        },
        quotedPost: {
            ...quote,
            userId: quoteAuthor.userId,
            username: quoteAuthor.username,
            avatar: quoteAuthor.avatar,
            banner: quoteAuthor.avatar,
            displayName: quoteAuthor.displayName
        },
        replyingTo: {
            ...originalPost,
            userId: originalPostAuthor.userId,
            username: originalPostAuthor.username,
            avatar: originalPostAuthor.avatar,
            banner: originalPostAuthor.avatar,
            displayName: originalPostAuthor.displayName
        },
        ...currentUser && ({
            liked: isNotNull(Likes.userId),
            reposted: isNotNull(Repost.userId)
        })
    })
        .from(Post)
        .innerJoin(User, eq(User.userId, Post.userId))
        .leftJoin(likeQ, eq(Post.postId, likeQ.postId))
        .leftJoin(repostQ, eq(Post.postId, repostQ.postId))
        .leftJoin(quote, eq(quote.postId, Post.quotedPost))
        .leftJoin(quoteAuthor, eq(quote.userId, quoteAuthor.userId))
        .leftJoin(originalPost, eq(originalPost.postId, Post.replyTo))
        .leftJoin(originalPostAuthor, eq(originalPost.userId, originalPostAuthor.userId))
        .where(and(isNull(Post.replyTo)))
        .limit(100)
        .orderBy(desc(Post.dateCreated))

    if (currentUser) {
        query.leftJoin(Likes, and(eq(Post.postId, Likes.postId), eq(Likes.userId, currentUser?.userId)))
        query.leftJoin(Repost, and(eq(Post.postId, Repost.postId), eq(Repost.userId, currentUser?.userId)))
    }
    const posts = await query

    res.json(
        posts.map(p => {
            const { replyingTo, quotedPost, ...x } = p
            return {
                ...x,
                ...replyingTo?.postId && { replyingTo },
                ...quotedPost?.postId && { quotedPost },
            }
        }))
}

