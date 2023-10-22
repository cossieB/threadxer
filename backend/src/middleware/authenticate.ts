import type {Request, Response, NextFunction} from "express"

function authenticate(req: Request, res: Response, next: NextFunction) {
    console.log(req.cookies)
    next()
}