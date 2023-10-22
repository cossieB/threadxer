import { parse } from "cookie"
import type { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv'
import AppError from "../utils/AppError";
dotenv.config()

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const cookie = parse(req.headers.cookie ?? "")
    if (!cookie.at)
        return next(new AppError('Invalid Token', 401))
    try {
        const token = jwt.verify(cookie.at, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload
        res.locals.userId = token.userId
        next()
    } catch (error) {
        next(new AppError('Invalid Token', 403))
    }
}