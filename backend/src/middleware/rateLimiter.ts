import type { Request, Response, NextFunction } from "express"
import AppError from "../utils/AppError"

export function rateLimiter(name: string, limit: number, window: number) {
    return function (req: Request, res: Response, next: NextFunction) {
        
    }
}