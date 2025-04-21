import { isNotNull, and, eq, desc } from "drizzle-orm"
import { postsPerPage } from "~/config/variables.js"
import { db } from "~/db/drizzle.js"
import { Media, Post, User } from "~/db/schema.js"
import { getLikes } from "~/queries/getLikes.js"
import { getPosts } from "~/queries/getPosts.js"
import { getPostsAndReposts } from "~/queries/getPostsAndReposts.js"
import { TokenUser } from "~/types.js"

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