import cookie from 'cookie';
import { redis } from "./redis";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
import { type TokenUser } from '../types';

dotenv.config()

export function createAccessToken(user: TokenUser) {
    return jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '15m'
    })
}
export function createRefreshToken(user: TokenUser) {
    return jwt.sign({user}, process.env.REFRESH_TOKEN_SECRET!)
}
export async function generateCookie(user: TokenUser) {
    const refreshToken = createRefreshToken(user);

    await redis.setex(`refresh:${refreshToken}`, 60 * 60 * 24 * 30, user.userId);

    const refreshCookie = cookie.serialize('rf', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV == 'production',
        sameSite: true,
        maxAge: 60 * 60 * 24 * 30
    });
    return refreshCookie;
}
