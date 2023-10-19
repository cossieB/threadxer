import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import path from "path";
import dotenv from 'dotenv'
import { createUploadthingExpressHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";
import AppError from "./utils/AppError";

dotenv.config()
const app = express()

// Express Middleware
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(path.resolve(__dirname, '../public')))

app.use("/api/uploadthing", createUploadthingExpressHandler({
    router: uploadRouter,
}),
);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    if (err instanceof AppError)
        return res.status(err.status).json({message: err.message})
    return res.status(500).json({message: "Something went wrong"})
})

const PORT = process.env.PORT ?? 8080

app.listen(PORT, () => {
    console.log(`Listening at http://127.0.0.1:${PORT}`)
})

