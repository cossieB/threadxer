import { response, type Request, type Response } from "express";
import { db } from "../db/drizzle";
import { Likes, Post, Repost, User } from "../db/schema";
import { SQL, and, count, desc, eq, isNotNull, isNull, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { TokenUser } from "../types";

export function getPosts(res: Response, withReposts = false) {
    const currentUser = res.locals.token?.user;
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
        ...(withReposts && {
            isRepost: isNotNull(Repost.dateCreated)
        }),
        ...(currentUser && {
            liked: isNotNull(Likes.userId) as SQL<boolean>,
            reposted: isNotNull(Repost.userId) as SQL<boolean>
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

    if (currentUser) {
        query.leftJoin(Likes, and(eq(Post.postId, Likes.postId), eq(Likes.userId, currentUser?.userId)));
        query.leftJoin(Repost, and(eq(Post.postId, Repost.postId), eq(Repost.userId, currentUser?.userId)));
    }

    return query;
}
export function getPostsAndReposts(currentUser: TokenUser | undefined, username: string) {
    
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
    const reposts = db.$with('rp').as(
        db.select()
            .from(Repost)
            .innerJoin(User, eq(User.userId, Repost.userId))
            .where(eq(User.usernameLower, username))
    )
    const quote = alias(Post, 'q');
    const quoteAuthor = alias(User, 'qa');
    const originalPost = alias(Post, 'op');
    const originalPostAuthor = alias(User, 'opa');

    const query = db.with(likeQ, repostQ, reposts).select({
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
        isRepost: isNotNull(reposts.reposts.repostId),
        ...(currentUser && {
            liked: isNotNull(Likes.userId) as SQL<boolean>,
            reposted: isNotNull(Repost.userId) as SQL<boolean>
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
        .leftJoin(reposts, eq(reposts.reposts.postId, Post.postId))
        .orderBy(desc(sql<Date>`COALESCE(${reposts.reposts.dateCreated}, ${Post.dateCreated})`))
        .where(or(
            eq(User.usernameLower, username),
            eq(reposts.users.usernameLower, username)
        ))

    if (currentUser) {
        query.leftJoin(Likes, and(eq(Post.postId, Likes.postId), eq(Likes.userId, currentUser?.userId)));
        query.leftJoin(Repost, and(eq(Post.postId, Repost.postId), eq(Repost.userId, currentUser?.userId)));
    }
    return query;
}

