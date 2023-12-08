import { parse } from "cookie"
import type { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv'
import AppError from "../utils/AppError";
import { TokenUser } from "../types";
dotenv.config()

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const cookie = parse(req.headers.cookie ?? "")
    if (!cookie.rf) {
        res.locals.authError = new AppError('Invalid or no token', 401)
    }
    try {
        const token = jwt.verify(cookie.rf, process.env.REFRESH_TOKEN_SECRET!) as {user: TokenUser, iat: number}; 
        res.locals.token = token
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