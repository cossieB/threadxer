import { response, type Request, type Response } from "express";
import { db } from "../db/drizzle";
import { Likes, Post, Repost, User } from "../db/schema";
import { SQL, and, count, eq, isNotNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { TokenUser } from "../types";

export async function getLikes(username: string, currentUser?: TokenUser) {
    
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
    );
    const repostQ = db.$with('r').as(
        db.select({
            postId: Repost.postId,
            c: count().as('repost_count')
        })
            .from(Repost)
            .groupBy(Repost.postId)
    );

    const quote = alias(Post, 'q');
    const quoteAuthor = alias(User, 'qa');
    const originalPost = alias(Post, 'op');
    const originalPostAuthor = alias(User, 'opa');
    const pageUser = alias(User, 'pu')

    const query = db.with(likeQ, repostQ).select({
        post: Post,
        user: {
            userId: User.userId,
            username: User.username,
            avatar: User.avatar,
            banner: User.avatar,
            displayName: User.displayName
        },
        quoteAuthor: {
            username: quoteAuthor.username,
            avatar: quoteAuthor.avatar,
            banner: quoteAuthor.avatar,
            displayName: quoteAuthor.displayName,
        },
        quotePost: quote,
        originalPostAuthor: {
            username: originalPostAuthor.username,
            avatar: originalPostAuthor.avatar,
            banner: originalPostAuthor.avatar,
            displayName: originalPostAuthor.displayName,
        },
        originalPost,
        likes: sql<number> `COALESCE (${likeQ.c}::INT, 0)`,
        reposts: sql<number> `COALESCE (${repostQ.c}::INT, 0)`,
        ...(currentUser && {
            liked: isNotNull(Likes.userId) as SQL<boolean>,
            reposted: isNotNull(Repost.userId) as SQL<boolean>
        })
    })
        .from(Likes)
        .innerJoin(Post, eq(Likes.postId, Post.postId))
        .innerJoin(User, eq(User.userId, Post.userId))
        .innerJoin(pageUser, 
            and(
                eq(pageUser.userId, Likes.userId), 
                eq(pageUser.usernameLower, username.toLowerCase())
            ))
        .leftJoin(likeQ, eq(Post.postId, likeQ.postId))
        .leftJoin(repostQ, eq(Post.postId, repostQ.postId))
        .leftJoin(quote, eq(quote.postId, Post.quotedPost))
        .leftJoin(quoteAuthor, eq(quote.userId, quoteAuthor.userId))
        .leftJoin(originalPost, eq(originalPost.postId, Post.replyTo))
        .leftJoin(originalPostAuthor, eq(originalPost.userId, originalPostAuthor.userId))

    if (currentUser) {
        query.leftJoin(Likes, and(eq(Post.postId, Likes.postId), eq(Likes.userId, currentUser?.userId)));
        query.leftJoin(Repost, and(eq(Post.postId, Repost.postId), eq(Repost.userId, currentUser?.userId)));
    }

    return query;
}