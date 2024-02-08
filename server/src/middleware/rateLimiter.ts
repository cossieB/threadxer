import { FastifyReply, FastifyRequest } from "fastify";
import AppError from "../utils/AppError"
import { redis } from "../redis";
import { TRPCError } from "@trpc/server"
import { Context } from "../context";

type RateLimitOptions = {
    name: string,
    limit: number,
    window: number,
    ctx: Context,
    req: FastifyRequest
}

export async function rateLimiter(opts: RateLimitOptions) {

    const key = `${opts.name}:${opts.ctx.user?.userId ?? opts.req.ip}`;
    const count = await redis.incr(key);
    redis.expire(key, opts.window, 'NX')
    if (count > opts.limit)
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: "You're doing that too much" })

}
