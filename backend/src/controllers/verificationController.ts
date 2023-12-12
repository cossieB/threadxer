import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import type { Request, Response, NextFunction } from "express";
import { randomInt } from "crypto";
import { PostgresError } from "postgres";
import { RefreshTokens, User, VerificationCodes } from "../db/schema";
import { handleTokens } from "../utils/generateCookies";
import { eq, sql } from "drizzle-orm";
import { draftVerificationEmail } from "../utils/draftEmail";

export async function verifyUser (req: Request, res: Response, next: NextFunction) {
    const oldAccessToken = res.locals.token!;
    if (!oldAccessToken.user.isUnverified)
        return next(new AppError("Already verified", 400))
    const row = await db.query.VerificationCodes.findFirst({
        where(fields, operators) {
            return operators.eq(fields.userId, oldAccessToken.user.userId)
        }
    })
    if (!row)
        return next(new AppError('Error. Please click "resend".', 400))
    if (row.expiry < new Date) {
        const code = randomInt(999999).toString().padStart(6, '0')
        draftVerificationEmail(oldAccessToken.user.username, code, oldAccessToken.user.email)
        return next(new AppError("Code expired. Check your email for a new code.", 400))
    }
    try {
        if (row.code !== req.body.code)
            return next(new AppError('Invalid Code', 400))
        const now = new Date;
        await db.transaction(async tx => {
            await tx.update(User)
                .set({
                    emailVerified: now
                })
                .where(eq(User.userId, oldAccessToken.user.userId))
            await tx.update(VerificationCodes)
                .set({
                    dateUsed: now
                })
            await tx.delete(RefreshTokens).where(eq(RefreshTokens.token, req.cookies.rf))
        })
        const { accessToken: newAccessToken, cookie } = await handleTokens({ ...oldAccessToken.user, isUnverified: false }, async refreshToken => {
            await db.transaction(async tx => {
                await tx.delete(RefreshTokens).where(eq(RefreshTokens.token, req.cookies.rf))
                await tx.insert(RefreshTokens).values({
                    token: refreshToken,
                    userId: oldAccessToken.user.userId
                })
            })
        })
        res.setHeader('Set-Cookie', cookie)
        return res.json({ jwt: newAccessToken })
    } catch (error) {
        next(error)
    }
}

export async function resendVerificationToken (req: Request, res: Response, next: NextFunction) {
    const code = randomInt(999999).toString().padStart(6, '0');
    const accessToken = res.locals.token!;
    if (!accessToken.user.isUnverified)
        return next(new AppError('Already Verified', 400))
    try {
        await db.insert(VerificationCodes)
            .values({
                userId: accessToken.user.userId,
                code,
            })
            .onConflictDoUpdate({
                target: VerificationCodes.userId,
                set: {
                    code,
                    expiry: sql`NOW() + INTERVAL '72 hours'`
                }
            })
        draftVerificationEmail(accessToken.user.username, code, accessToken.user.email)
        res.sendStatus(200)
    }
    catch (error) {
        if (error instanceof PostgresError) {
            if (error.message.includes("violates foreign key constraint"))
                return next(new AppError("User Not Found", 400))
        }
        next(error)
    }
}