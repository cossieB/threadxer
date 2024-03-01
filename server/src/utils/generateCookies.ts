import cookie from 'cookie';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
import { type TokenUser } from '../types';
import { db } from '../db/drizzle';
import { RefreshTokens } from '../db/schema';
import { getAuth } from 'firebase-admin/auth';

dotenv.config()

export function createAccessToken(user: TokenUser) {
    return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '15m'
    })
}
export function createRefreshToken(user: TokenUser) {
    return jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET!)
}
export function generateCookie(refreshToken: string) {
    const refreshCookie = cookie.serialize('rf', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV == 'production',
        sameSite: true,
        maxAge: 60 * 60 * 24 * 30,
    });
    return refreshCookie;
}

/**
 * This function creates access token, refresh token and a cookie of the refresh token and saves the token to the database.
 * @param user 
 * @param saveToDb Optional function to save the refresh token to the database in case you want to use a SQL transaction.
 * @returns 
 */
export async function handleTokens(user: TokenUser, saveToDb?: (refreshToken: string) => Promise<void>) {
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user)
    const cookie = generateCookie(refreshToken);
    const fb = await getAuth().createCustomToken(user.userId)

    if (saveToDb)
        await saveToDb(refreshToken)
    else
        await db
            .insert(RefreshTokens)
            .values({
                token: refreshToken,
                userId: user.userId
            })

    return { accessToken, cookie, fb }
}