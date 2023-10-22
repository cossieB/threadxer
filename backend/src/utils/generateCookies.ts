import { createAccessToken, createRefreshToken } from "./createJWT";
import cookie from 'cookie';
import { redis } from "./redis";

export async function generateCookies(userId: string) {
    const refreshToken = createRefreshToken(userId);
    const accessToken = createAccessToken(userId);

    await redis.set(`refresh:${refreshToken}`, userId);

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
    return { accessCookie, refreshCookie };
}
