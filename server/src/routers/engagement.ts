import { z } from "zod";
import { eq, inArray, sql } from "drizzle-orm";
import postgres from "postgres";
import { TRPCError } from "@trpc/server";
import { db } from "../db/drizzle.js";
import { Likes, Repost, Post } from "../db/schema.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { redis } from "../redis.js";
import { protectedProcedure, publicProcedure, router } from "../trpc.js";
import { filterViews } from "../utils/filterViews.js";

export const engagementRouter = router({
    likePost: protectedProcedure
        .input(z.string().uuid())
        .mutation(async ({ ctx, input }) => {
            await rateLimiter({
                name: 'like',
                ctx,
                limit: 10,
                window: 60,
            })
            try {
                await db.insert(Likes).values({
                    postId: input,
                    userId: ctx.user.userId
                })
                ctx.res.status(201)
                return 1
            }
            catch (error: unknown) {
                if (error instanceof postgres.PostgresError) {
                    if (error.message.includes("likes_post_id_user_id_unique")) {
                        await db.delete(Likes).where(eq(Likes.postId, input))
                        ctx.res.status(200)
                        return -1
                    }
                }
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
            }
        }),

    repostPost: protectedProcedure
        .input(z.string().uuid())
        .mutation(async ({ ctx, input }) => {
            await rateLimiter({
                name: 'repost',
                ctx,
                limit: 10,
                window: 60,
            })
            try {
                await db.insert(Repost).values({
                    postId: input,
                    userId: ctx.user.userId
                })
                ctx.res.status(201)
                return 1
            }
            catch (error: unknown) {
                if (error instanceof postgres.PostgresError) {
                    if (error.message.includes("reposts_post_id_user_id_unique")) {
                        await db.delete(Repost).where(eq(Repost.postId, input))
                        ctx.res.status(200)
                        return -1
                    }
                }
                console.error(error)
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
            }
        }),

    viewPost: publicProcedure
        .input(z.array(z.string().uuid()))
        .mutation(async ({ input, ctx }) => {
            const arr = await filterViews(input, ctx.req.ip)
            if (arr.length === 0) return;
            arr.forEach(postId => redis.setex(`views:${ctx.req.ip}:${postId}`, 3600, `views:${ctx.req.ip}:${postId}`))
            await db
                .update(Post)
                .set({ views: sql`${Post.views} + 1` })
                .where(inArray(Post.postId, arr))
        })
})

