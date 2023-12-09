import { parse } from "cookie"
import type { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv'
import AppError from "../utils/AppError";
import { TokenUser } from "../types";
dotenv.config()

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader || authHeader.split(" ").length < 2){
        res.locals.authError = new AppError('Invalid or no token', 401)
        return next()
    }
    const at = authHeader.split(" ")[1]; 
    try {
        const token = jwt.verify(at, process.env.ACCESS_TOKEN_SECRET!) as {user: TokenUser, iat: number};
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