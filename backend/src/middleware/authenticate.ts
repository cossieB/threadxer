import { parse } from "cookie"
import type { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv'
import AppError from "../utils/AppError";
dotenv.config()

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const cookie = parse(req.headers.cookie ?? "")
    if (!cookie.at) {
        res.locals.authError = new AppError('Invalid or no token', 401)
    }
    try {
        const user = jwt.verify(cookie.at, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload
        res.locals.user = user
    } 
    catch (error) {
        res.locals.authError = new AppError('Invalid Token', 403)
    }
    finally {
        next()
    }
}

export function authorize(req: Request, res: Response, next: NextFunction) {
    if (res.locals.authError)
        return next(res.locals.authError)
    next()
}