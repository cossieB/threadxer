import type { Request, Response, NextFunction } from "express"
import AppError from "../utils/AppError"

export function validation(arr: string[]) {
    return function(req: Request, res: Response, next: NextFunction) {
        for (const prop of arr) {
            const key = req.body[prop]
            if (!key || typeof key != 'string')
                return next(new AppError("Please don't bypass client validation", 400))
        }
        next()
    }
}