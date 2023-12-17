import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import type { Request, Response, NextFunction } from "express";
import { RefreshTokens } from "../db/schema";
import { handleTokens } from "../utils/generateCookies";
import { eq } from "drizzle-orm";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";

export async function getAccessToken(req: Request, res: Response, next: NextFunction) {
    const refresh = req.cookies.rf;
    if (!refresh)
        return next(new AppError('No Token', 401))
    try {
        const token = jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
        const found = await db.query.RefreshTokens.findFirst({
            where(fields, operators) {
                return operators.eq(fields.token, refresh)
            },
        })
        // Handling refresh token reuse
        if (!found) {
            await db.delete(RefreshTokens).where(eq(RefreshTokens.userId, token.user.userId));
            res.clearCookie('rf')
            return next(new AppError('Invalid Token', 403))
        }
        const { accessToken, cookie, fb } = await handleTokens(token.user, async refreshToken => {
            await db.transaction(async tx => {
                await tx.delete(RefreshTokens).where(eq(RefreshTokens.token, refresh))
                await tx.insert(RefreshTokens).values({
                    token: refreshToken,
                    userId: token.user.userId
                })
            })
        })
        res.setHeader('Set-Cookie', cookie)
        return res.json({ jwt: accessToken, fb })
    }
    catch (error: any) {
        console.log(error)
        next(error)
    }
}