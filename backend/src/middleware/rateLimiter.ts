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
export function rateLimiter(name: string, limit: number, window: number) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const key = `${name}:${res.locals.token?.user.userId ?? req.ip}`;
        const count = await redis.incr(key);
        redis.expire(key, window, 'NX')
        if (count > limit)
            return next(new AppError("You're doing that too much", 429))

        next()
    }
}