import { FastifyCorsOptions } from "@fastify/cors";
import AppError from "../utils/AppError.js";

const allowList = [process.env.DOMAIN, 'http://localhost:5173', 'http://127.0.0.1:5173'];
export const corsOptions: FastifyCorsOptions = {
    origin(requestOrigin, callback) {
        if (allowList.includes(requestOrigin)) {
            callback(null, true)
        }
        else 
            callback(new AppError("Cors", 403), false)
    },
    optionsSuccessStatus: 200
}