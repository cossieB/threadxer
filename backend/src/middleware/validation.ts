import type { Request, Response, NextFunction } from "express"
import AppError from "../utils/AppError"

type O = {
    property: string,
    type: string | boolean | number | null
}
/**
 * 
 * @param arr An array of required properties in request body.
 * @returns 
 */
export function validation(arr: (string | O)[]) {
    return function (req: Request, res: Response, next: NextFunction) {
        for (const element of arr) {
            const [property, type] = typeof element === 'string' ? [element, 'string'] : [element.property, element.type]
            const key = req.body[property]
            if (!key || typeof key != type)
                return next(new AppError("Please don't bypass client validation", 400))

        }
        next()
    }
}