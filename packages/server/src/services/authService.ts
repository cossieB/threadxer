import cookie from 'cookie';
import jwt from 'jsonwebtoken'
import { getAuth } from 'firebase-admin/auth';
import { db } from '../db/drizzle.js';
import { RefreshTokens, User } from '../db/schema.js';
import { TokenUser } from '../types.js';
import { eq } from 'drizzle-orm';
import { UserUpdate } from '@/models/User.js';

export async function createTokens(user: TokenUser) {
    return handleTokens(user)
}

export function getToken(refresh: string) {
    return db.query.RefreshTokens.findFirst({
        where(fields, operators) {
            return operators.eq(fields.token, refresh)
        },
    })
}

export async function updateTokensAndLogin(user: TokenUser) {
    return handleTokens(user, async refreshToken => {
        db.transaction(async tx => {
            await tx.insert(RefreshTokens).values({
                token: refreshToken,
                userId: user.userId
            })
            await tx.update(User).set({
                lastLogin: new Date
            })
        })
    })
}

export async function updateTokensAndUser(user: TokenUser, refresh: string, input: UserUpdate) {
    return handleTokens(user, async refreshToken => {
        await db.transaction(async tx => {
            await tx.delete(RefreshTokens).where(eq(RefreshTokens.token, refresh))
            await tx.insert(RefreshTokens).values({
                token: refreshToken,
                userId: user.userId
            })
            await tx
                .update(User)
                .set({ ...input })
                .where(eq(User.userId, user.userId))
        })
    })
}

export function newRefreshToken(user: TokenUser, refresh: string) {
    return handleTokens(user, async refreshToken => {
        await db.transaction(async tx => {
            await tx.delete(RefreshTokens).where(eq(RefreshTokens.token, refresh))
            await tx.insert(RefreshTokens).values({
                token: refreshToken,
                userId: user.userId
            })
        })
    })
}

export async function deleteTokens(refresh: string) {
    await db.delete(RefreshTokens).where(eq(RefreshTokens.token, refresh))
}

export function deleteUserTokens(userId: string) {
    return db.delete(RefreshTokens).where(eq(RefreshTokens.userId, userId));
}



/**
 * This function creates access token, refresh token and a cookie of the refresh token and saves the token to the database.
 * @param user 
 * @param saveToDb Optional function to save the refresh token to the database in case you want to use a SQL transaction.
 * @returns 
 */
async function handleTokens(user: TokenUser, saveToDb?: (refreshToken: string) => Promise<void>) {
    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '15m'
    })
    const refreshToken = jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET!)
    const cookie = generateCookie(refreshToken);
    const firebaseToken = await getAuth().createCustomToken(user.userId)

    if (saveToDb)
        await saveToDb(refreshToken)
    else
        await db
            .insert(RefreshTokens)
            .values({
                token: refreshToken,
                userId: user.userId
            })

    return { accessToken, cookie, firebaseToken }
}

function generateCookie(refreshToken: string) {
    const refreshCookie = cookie.serialize('rf', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV == 'production',
        sameSite: true,
        maxAge: 60 * 60 * 24 * 30,
    });
    return refreshCookie;
}