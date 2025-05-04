import { z } from "zod";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { protectedProcedure, publicProcedure, router } from "../trpc.js";
import * as engagementService from "#server/services/engagementService.js"
import { FastifyReply } from "fastify";

export const engagementRouter = router({
    likePost: protectedProcedure
        .input(z.string().uuid())
        .mutation(async ({ ctx, input }) => {
            await rateLimiter({
                name: 'like',
                userIdentifier: ctx.user?.userId ?? ctx.req.ip,
                limit: 10,
                window: 60,
            })
            const res = await engagementService.likeOrUnlikePost(input, ctx.user)
            setStatus(res, ctx);
            return res
        }),

    repostPost: protectedProcedure
        .input(z.string().uuid())
        .mutation(async ({ ctx, input }) => {
            await rateLimiter({
                name: 'repost',
                userIdentifier: ctx.user?.userId ?? ctx.req.ip,
                limit: 10,
                window: 60,
            })
            const res = await engagementService.repostOrUnrepost(input, ctx.user)
            setStatus(res, ctx);
            return res
        }),

    viewPost: publicProcedure
        .input(z.array(z.string().uuid()))
        .mutation(async ({ input, ctx }) => {
            await engagementService.viewPosts(input, ctx.req.ip)
        })
})

function setStatus(res: number, ctx: { res: FastifyReply }) {
    if (res == 1) {
        ctx.res.status(201);
    }
    else {
        ctx.res.status(200);
    }
}

