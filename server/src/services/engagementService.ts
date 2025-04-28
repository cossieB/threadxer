import { and, eq, inArray, sql } from "drizzle-orm"
import postgres from "postgres"
import { db } from "~/db/drizzle.js"
import { Likes, Post, Repost } from "~/db/schema.js"
import { redis } from "~/redis.js"
import { TokenUser } from "~/types.js"

type UserPartial = Pick<TokenUser, 'userId'>

export async function likeOrUnlikePost(postId: string, user: UserPartial) {
    try {
        await db.insert(Likes).values({
            postId: postId,
            userId: user.userId
        })        
        return 1
    }
    catch (error: unknown) {
        if (error instanceof postgres.PostgresError) {
            if (error.message.includes("likes_post_id_user_id_unique")) {
                await db.delete(Likes).where(
                    and(
                        eq(Likes.postId, postId),
                        eq(Likes.userId, user.userId)
                    )
                )                
                return -1
            }
        }
        console.error(error)
        throw error
    }
}

export async function repostOrUnrepost(postId: string, user: UserPartial) {
    try {
        await db.insert(Repost).values({
            postId: postId,
            userId: user.userId
        })
        return 1
    }
    catch (error: unknown) {
        if (error instanceof postgres.PostgresError) {
            if (error.message.includes("reposts_post_id_user_id_unique")) {
                await db.delete(Repost).where(
                    and(
                        eq(Repost.postId, postId),
                        eq(Repost.userId, user.userId)
                    )
                )
                return -1
            }
        }
        console.error(error)
        throw error
    }
}

export async function viewPosts(postIds: string[], ip: string) {
    const filteredIds = await filterViews(postIds, ip)
    filteredIds.forEach(postId => redis.setex(`views:${ip}:${postId}`, 3600, `views:${ip}:${postId}`))
    await db
        .update(Post)
        .set({ views: sql`${Post.views} + 1` })
        .where(inArray(Post.postId, postIds))
}

/**
 * 
 * @param postIds 
 * @param ip 
 * @returns Array of post ids user hasn't viewed recently
 */
async function filterViews(postIds: string[], ip: string) {
    const promises = postIds.map(postId => redis.get(`views:${ip}:${postId}`));
    const z = await Promise.all(promises);
    const arr: string[] = [];
    z.forEach((val, i) => {
        if (!val) {
            arr.push(postIds[i]);
        }
    });
    return arr;
}
