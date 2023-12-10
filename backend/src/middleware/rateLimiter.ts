import type { Request, Response, NextFunction } from "express"
import AppError from "../utils/AppError"
import { redis } from "../utils/redis"

/**
 * 
 * @param name the prefix used to store values in Redis
 * @param limit 
 * @param window time in seconds
 * @returns 
 */
export  function rateLimiter(name: string, limit: number, window: number) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const key = `${name}:${res.locals.token?.user ?? req.ip}`;
        const count = await redis.incr(key );
        if (count == 1)
            redis.expire(key, window)
        if (count > limit)
            return next(new AppError('Too many requests', 429))

        next()
    }
}