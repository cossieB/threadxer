import { count, sql } from "drizzle-orm";
import { db } from "../db/drizzle.js";
import { Likes, Repost, Post, Media } from "../db/schema.js";

export const likeCount = db.$with('l').as(
    db.select({
        postId: Likes.postId,
        c: count().as('like_count'),
    })
        .from(Likes)
        .groupBy(Likes.postId)
);
export const repostCount = db.$with('r').as(
    db.select({
        postId: Repost.postId,
        c: count().as('repost_count')
    })
        .from(Repost)
        .groupBy(Repost.postId)
);
export const quotesCount = db.$with('qc').as(
    db.select({
        quotedPost: Post.quotedPost,
        c: count().as('quote_count')
    })
        .from(Post)
        .groupBy(Post.quotedPost)
);
export const replyCount = db.$with('rc').as(
    db.select({
        replyTo: Post.replyTo,
        c: count().as('reply_count')
    })
        .from(Post)
        .groupBy(Post.replyTo)
);

const md = db.select({
        postId: Media.postId,
        url: Media.url,
        isVideo: Media.isVideo
    })
    .from(Media)
    .as('mds')
    
type M = {
    url: string, is_video: boolean
}
export const mediaAgg = db.$with('md').as(
    db.select({
        postId: md.postId,
        mediaArr: sql<M[]>`json_agg(mds)`.as('media_arr')
    })
        .from(md)
        .groupBy(md.postId)
);
