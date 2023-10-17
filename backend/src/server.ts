import cors from "cors";
import express from "express";
import path from "path";
import dotenv from 'dotenv'
import { createUploadthingExpressHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";

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