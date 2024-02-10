import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import type { Request, Response, NextFunction } from "express";
import { RefreshTokens } from "../db/schema";
import { handleTokens } from "../utils/generateCookies";
import { eq } from "drizzle-orm";
import jwt, { type JwtPayload } from "jsonwebtoken";

export async function getAccessToken(req: Request, res: Response, next: NextFunction) {

}