import type { Request, Response, NextFunction } from "express";
import { db } from "../db/drizzle";
import { Hashtags, Likes, Media, Post, Repost, User } from "../db/schema";
import AppError from "../utils/AppError";
import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm";

export async function createPost(req: Request, res: Response, next: NextFunction) {
    const user = res.locals.token!.user
    const { text } = req.body as { text: string, media?: string[] }
    const media: string[] = req.body.media ?? []
    if (text.length + media.length === 0)
        return next(new AppError("Empty posts are not allowed", 400))

    const rgx = /(?<=\s|^)(#\w+)(?=\s|$)/g
    const matches = text.matchAll(rgx);
    const uniqueTags = new Set<string>()
    for (const match of matches) {
        uniqueTags.add(match[0].toLowerCase())
    }
    const uniques = Array.from(uniqueTags);

    try {
        const postId = await db.transaction(async tx => {
            const row = await tx.insert(Post)
                .values({
                    userId: user.userId,
                    text: text.trim(),
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
    const {postId} = req.params;
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
            email: User.email,
            displayName: User.displayName
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
        .where(eq(Post.postId, postId))

    if (currentUser) {
        query.leftJoin(Likes, and(eq(Post.postId, Likes.postId), eq(Likes.userId, currentUser?.userId)))
        query.leftJoin(Repost, and(eq(Post.postId, Repost.postId), eq(Repost.userId, currentUser?.userId)))
    }
    const posts = await query
    const post = posts.at(0);
    if (!post)
        return next(new AppError("That post doesn't exist", 404))
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
            email: User.email,
            displayName: User.displayName
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
        .limit(100)
        .orderBy(desc(Post.dateCreated))

    if (currentUser) {
        query.leftJoin(Likes, and(eq(Post.postId, Likes.postId), eq(Likes.userId, currentUser?.userId)))
        query.leftJoin(Repost, and(eq(Post.postId, Repost.postId), eq(Repost.userId, currentUser?.userId)))
    }
    const posts = await query

    res.json(posts)
}

