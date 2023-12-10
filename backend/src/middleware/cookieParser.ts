import type { Request, Response, NextFunction } from "express"
import cookie from 'cookie'

export function cookieParser(req: Request, res: Response, next: NextFunction) {
    req.cookies = cookie.parse(req.headers?.cookie ?? "");
    next()
}