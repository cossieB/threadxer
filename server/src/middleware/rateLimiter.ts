import { redis } from "../redis.js";
import { TRPCError } from "@trpc/server"
import { Context } from "../context.js";

type RateLimitOptions = {
    name: string,
    limit: number,
    /** Time in seconds */
    window: number,
    ctx: Context,
}

export async function rateLimiter(opts: RateLimitOptions) {

    const key = `${opts.name}:${opts.ctx.user?.userId ?? opts.ctx.req.ip}`;
    const count = await redis.incr(key);
    redis.expire(key, opts.window, 'NX')
    if (count > opts.limit)
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: "You're doing that too much" })

}
