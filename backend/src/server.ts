import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import path from "path";
import dotenv from 'dotenv'
import { createUploadthingExpressHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";
import AppError from "./utils/AppError";
import * as Routes from "./routes";
import { authenticate } from "./middleware/authenticate";
import { cookieParser } from "./middleware/cookieParser";

dotenv.config()
const app = express()

// Express Middleware
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieParser)
app.use(express.static(path.resolve(__dirname, '../public')))
app.use(authenticate)

app.use("/api/uploadthing", createUploadthingExpressHandler({
    router: uploadRouter,
}));
app.use('/api/auth', Routes.authRouter)
app.use('/api/auth/verify', Routes.verificationRouter)
app.use('/api/auth/refresh', Routes.refreshRoutes)
app.use('/api/users', Routes.userRouter)

app.all('/api/*', (req, res) => {
    res.sendStatus(404)
})

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '..', '/public', 'index.html'))
})

app.use("*", (req, res) => {
    res.sendStatus(404)
})
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError)
        return res.status(err.status).json({ error: err.message })
    console.error(err.stack);
    return res.status(500).json({ error: "Something went wrong. Please try again later." })
})

const PORT = process.env.PORT ?? 8080

app.listen(PORT, () => {
    console.log(`Listening at http://127.0.0.1:${PORT}`)
})

