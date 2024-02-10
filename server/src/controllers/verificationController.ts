import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import type { Request, Response, NextFunction } from "express";
import { randomInt } from "crypto";
import { PostgresError } from "postgres";
import { RefreshTokens, User, VerificationCodes } from "../db/schema";
import { handleTokens } from "../utils/generateCookies";
import { eq, sql } from "drizzle-orm";
import { draftVerificationEmail } from "../utils/draftEmail";

export async function verifyUser(req: Request, res: Response, next: NextFunction) {
   
}

export async function resendVerificationToken(req: Request, res: Response, next: NextFunction) {

}