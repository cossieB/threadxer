import { db } from "../db/drizzle";
import { Likes, Post, Repost, User } from "../db/schema";
import { SQL, and, count, desc, eq, isNotNull, isNull, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { TokenUser } from "../types";
import { likeCount, repostCount, quotesCount, replyCount, mediaAgg } from "./postSubQueries";

export function getPostsAndReposts(currentUser: TokenUser | undefined, username: string) {


    const quote = alias(Post, 'q');
    const quoteAuthor = alias(User, 'qa');
    const originalPost = alias(Post, 'op');
    const originalPostAuthor = alias(User, 'opa');

    const reposts = db.$with('rp').as(
        db.select()
            .from(Repost)
            .innerJoin(User, eq(User.userId, Repost.userId))
            .where(eq(User.usernameLower, username))
    );

    const query = db.with(likeCount, repostCount, quotesCount, replyCount, reposts, mediaAgg).select({
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
        likes: sql<number> `COALESCE (${likeCount.c}::INT, 0)`,
        reposts: sql<number> `COALESCE (${repostCount.c}::INT, 0)`,
        quotes: sql<number> `COALESCE (${quotesCount.c}::INT, 0)`,
        replies: sql<number> `COALESCE (${replyCount.c}::INT, 0)`,
        isRepost: isNotNull(reposts.reposts.repostId),
        media: mediaAgg.mediaArr,
        ...(currentUser && {
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
        .leftJoin(reposts, eq(reposts.reposts.postId, Post.postId))
        .leftJoin(mediaAgg, eq(Post.postId, mediaAgg.postId))
        .orderBy(desc(sql<Date> `COALESCE(${reposts.reposts.dateCreated}, ${Post.dateCreated})`))
        .where(
            and(
                or(
                    eq(User.usernameLower, username),
                    eq(reposts.users.usernameLower, username)
                ),
                isNull(Post.replyTo)
            ));

    if (currentUser) {
        query.leftJoin(Likes, and(eq(Post.postId, Likes.postId), eq(Likes.userId, currentUser?.userId)));
        query.leftJoin(Repost, and(eq(Post.postId, Repost.postId), eq(Repost.userId, currentUser?.userId)));
    }
    return query;
}
