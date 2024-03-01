import { rateLimiter } from "../middleware/rateLimiter";
import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { PostgresError } from "postgres";
import { db } from "../db/drizzle";
import { Repost } from "../db/schema";
import { TRPCError } from "@trpc/server";

export const repostRouter = router({
    repostPost: protectedProcedure
        .input(z.string().uuid())
        .mutation(async ({ctx, input}) => {
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
                return
            }
            catch (error: unknown) {
                if (error instanceof PostgresError) {
                    if (error.message.includes("reposts_post_id_user_id_unique")) {
                        await db.delete(Repost).where(eq(Repost.postId, input))
                        ctx.res.status(200)
                        return 
                    }
                }
                console.error(error)
                throw new TRPCError({code: 'INTERNAL_SERVER_ERROR'})
            }
        })
})