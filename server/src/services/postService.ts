import { TRPCError } from "@trpc/server"
import { isNotNull, and, eq, desc, isNull } from "drizzle-orm"
import postgres from "postgres"
import { postsPerPage } from "~/config/variables.js"
import { db } from "~/db/drizzle.js"
import { Hashtags, Likes, Media, Post, User } from "~/db/schema.js"
import { CreatePost } from "~/models/Post.js"
import { getLikes } from "~/queries/getLikes.js"
import { getPosts } from "~/queries/getPosts.js"
import { getPostsAndReposts } from "~/queries/getPostsAndReposts.js"
import { postRepliesQuery } from "~/queries/postRepliesQuery.js"
import { TokenUser } from "~/types.js"
import { getHashtags } from "~/utils/getHashtags.js"

export async function createPost(user: TokenUser, post: CreatePost) {
    const uniques = getHashtags(post.text);
    return db.transaction(async tx => {
        const row = await tx.insert(Post)
            .values({
                userId: user.userId,
                text: post.text.trim(),
                quotedPost: post.quotedPost,
                didQuote: !!post.quotedPost,
                replyTo: post.replyTo,
                didReply: !!post.replyTo
            }).returning({
                postId: Post.postId
            })
        if (post.media.length > 0)
            await tx.insert(Media).values(post.media.map(m => ({
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
}

export async function getPost(postId: string, user: TokenUser | null) {
    try {
        const query = getPosts(user?.userId)
        query.where(eq(Post.postId, postId))
        const posts = await query
        return posts.at(0)
    }
    catch (error) {
        if (error instanceof postgres.PostgresError && error.message.includes("invalid input syntax for type uuid"))
            return
        throw error
    }
}

export async function getAllPosts(page: number, user: TokenUser | null) {
    const query = getPosts(user?.userId);
    query
        .where(isNull(Post.replyTo))
        .limit(postsPerPage + 1)
        .offset(page * postsPerPage)
        .orderBy(desc(Post.dateCreated));
    return query
}

export function getPostReplies(postId: string, page: number, user: TokenUser | null) {
    try {
        const query = postRepliesQuery(user?.userId)
        query
            .where(eq(Post.replyTo, postId))
            .limit(postsPerPage + 1)
            .offset(page * postsPerPage)
            .orderBy(desc(Post.dateCreated))

        return query
    }
    catch (error) {
        if (error instanceof postgres.PostgresError && error.message.includes("invalid input syntax for type uuid"))
            throw new TRPCError({ code: 'BAD_REQUEST', message: "That post doesn't exist" })
        throw error
    }
}

export function getPostQuotes(postId: string, page: number, user: TokenUser | null) {
    try {
        const query = postRepliesQuery(user?.userId)
        query
            .where(eq(Post.quotedPost, postId))
            .limit(postsPerPage + 1)
            .offset(page * postsPerPage)
            .orderBy(desc(Post.dateCreated))

        return query
    } 
    catch (error) {
        if (error instanceof postgres.PostgresError && error.message.includes("invalid input syntax for type uuid"))
            throw new TRPCError({ code: 'BAD_REQUEST', message: "That post doesn't exist" })
        throw error
    }
}

export async function getPostLikes(postId: string, page: number, user: TokenUser | null) {
    try {
        return db.select({
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
            .limit(postsPerPage + 1)
            .offset(page * postsPerPage)
    } 
    catch (error) {
        if (error instanceof postgres.PostgresError && error.message.includes("invalid input syntax for type uuid"))
            throw new TRPCError({ code: 'BAD_REQUEST', message: "That post doesn't exist" })
        throw error
    }
}

export function getUserPosts(username: string, user: TokenUser | null, page: number) {
    return getPostsAndReposts(username, user)
        .limit(postsPerPage + 1)
        .offset(page * postsPerPage)
}

export function getUserReplies(username: string, user: TokenUser | null, page: number) {
    const query = getPosts(user?.userId);
    query
        .where(
            and(
                isNotNull(Post.replyTo),
                eq(User.usernameLower, username)
            )
        )
        .limit(postsPerPage + 1)
        .offset(page * postsPerPage)
        .orderBy(desc(Post.dateCreated));

    return query
}

export function getUserLikes(username: string, user: TokenUser | null, page: number) {
    return getLikes(username, user)
        .limit(postsPerPage + 1)
        .offset(postsPerPage * page)
}

export async function getUserMedia(username: string, page: number) {
    const media = await db.select({
        url: Media.url,
        is_video: Media.isVideo,
        postId: Media.postId,
    })
        .from(Media)
        .innerJoin(Post, eq(Media.postId, Post.postId))
        .innerJoin(User, eq(Post.userId, User.userId))
        .where(eq(User.usernameLower, username.toLowerCase()))
        .limit(100)
        .offset(page * postsPerPage)
        .orderBy(desc(Post.dateCreated))

    return media
}