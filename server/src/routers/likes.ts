import { rateLimiter } from "../middleware/rateLimiter";
import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { PostgresError } from "postgres";
import { db } from "../db/drizzle";
import { Likes } from "../db/schema";
import { TRPCError } from "@trpc/server";

export const likeRouter = router({
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
                if (error instanceof PostgresError) {
                    if (error.message.includes("likes_post_id_user_id_unique")) {
                        await db.delete(Likes).where(eq(Likes.postId, input))
                        ctx.res.status(200)
                        return -1
                    }
                }
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
            }
        })
})