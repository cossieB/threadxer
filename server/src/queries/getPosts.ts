import { db } from "../db/drizzle.js";
import { Likes, Post, Repost, User } from "../db/schema.js";
import { SQL, and, eq, isNotNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { likeCount, repostCount, quotesCount, replyCount, mediaAgg } from "./postSubQueries.js";

export function getPosts(loggedInUserId?: string) {

    const quote = alias(Post, 'q');
    const quoteAuthor = alias(User, 'qa');
    const originalPost = alias(Post, 'op');
    const originalPostAuthor = alias(User, 'opa');

    const query = db.with(likeCount, repostCount, quotesCount, replyCount, mediaAgg).select({
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
        media: mediaAgg.mediaArr,
        originalPost,
        likes: sql<number> `COALESCE (${likeCount.c}::INT, 0)`,
        reposts: sql<number> `COALESCE (${repostCount.c}::INT, 0)`,
        quotes: sql<number> `COALESCE (${quotesCount.c}::INT, 0)`,
        replies: sql<number> `COALESCE (${replyCount.c}::INT, 0)`,
        ...(loggedInUserId && {
            liked: isNotNull(Likes.userId) as SQL<boolean>,
            reposted: isNotNull(Repost.userId) as SQL<boolean>
        })
    })
        .from(Post)
        .innerJoin(User, eq(User.userId, Post.userId))
        .leftJoin(likeCount, eq(Post.postId, likeCount.postId))
        .leftJoin(repostCount, eq(Post.postId, repostCount.postId))
        .leftJoin(replyCount, eq(Post.postId, replyCount.replyTo))
        .leftJoin(quotesCount, eq(Post.postId, quotesCount.quotedPost))
        .leftJoin(quote, eq(quote.postId, Post.quotedPost))
        .leftJoin(quoteAuthor, eq(quote.userId, quoteAuthor.userId))
        .leftJoin(originalPost, eq(originalPost.postId, Post.replyTo))
        .leftJoin(originalPostAuthor, eq(originalPost.userId, originalPostAuthor.userId))
        .leftJoin(mediaAgg, eq(Post.postId, mediaAgg.postId))

    if (loggedInUserId) {
        query.leftJoin(Likes, and(eq(Post.postId, Likes.postId), eq(Likes.userId, loggedInUserId)));
        query.leftJoin(Repost, and(eq(Post.postId, Repost.postId), eq(Repost.userId, loggedInUserId)));
    }

    return query;
}
