import cookie from 'cookie';
import { redis } from "./redis";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'

dotenv.config()

type TokenUser = {
    userId: string,
    username: string,
    avatar: string,
    banner: string,
    email: string,
    isUnverified: boolean
}

export function createAccessToken(user: TokenUser) {
    return jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '15m'
    })
}
export function createRefreshToken(user: TokenUser) {
    return jwt.sign({user}, process.env.REFRESH_TOKEN_SECRET!)
}
export async function generateCookies(user: TokenUser) {
    const refreshToken = createRefreshToken(user);
    const accessToken = createAccessToken(user);

    await redis.set(`refresh:${refreshToken}`, user.userId);

    const accessCookie = cookie.serialize('at', accessToken, {
        path: '/',
        maxAge: 60 * 15,
        httpOnly: true,
        secure: process.env.NODE_ENV == 'production',
        sameSite: true
    });
    const refreshCookie = cookie.serialize('rf', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV == 'production',
        sameSite: true,
        maxAge: 60 * 60 * 24 * 30
    });
    return { accessCookie, refreshCookie, jwt: accessToken };
}
