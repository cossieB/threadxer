import type { Request, Response, NextFunction } from "express"
import AppError from "../utils/AppError"

type O = {
    property: string,
    type?: 'string' | 'boolean' | 'number' | 'null' | 'array',
    min?: number,
    max?: number,
    regex?: RegExp,
    isRequired?: boolean
}

const defaults: Omit<Required<O>, 'property' | 'regex'> = {
    type: 'string',
    min: Number.NEGATIVE_INFINITY,
    max: Number.POSITIVE_INFINITY,
    isRequired: true
}

/**
 * 
 * @param arr An array of allowed properties in request body.
 * @returns 
 */
export function validation(arr: (string | O)[]) {
    return function (req: Request, res: Response, next: NextFunction) {
        for (const element of arr) {

            const options = typeof element === 'object' ? { ...defaults, ...element } : { ...defaults, property: element }
            const { property } = options
            const bodyValue = req.body[property];

            if (options.isRequired && !bodyValue) {
                return next(new AppError(`${bodyValue} is required`, 400))
            }
            if (bodyValue === undefined) continue
            
            if (options.type == 'array' && !Array.isArray(bodyValue))
                return next(new AppError(`Wrong type for ${property}`, 400))

            if (typeof bodyValue != options.type)
                return next(new AppError(`Wrong type for ${property}`, 400))

            if ((typeof bodyValue === 'string') && (bodyValue.length > options.max || bodyValue.length < options.min))
                return next(new AppError(`Invalid length for ${property}`, 400))

            if (options.regex && !options.regex.test(bodyValue))
                return next(new AppError(`Invalid ${property}`, 400))
        }
        next()
    }
}