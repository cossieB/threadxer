import {sign} from 'jsonwebtoken'
import dotenv from 'dotenv';
dotenv.config()

export function createAccessToken(userId: string) {
    return sign(userId, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '15m'
    })
}

export function createRefreshToken(userId: string) {
    return sign(userId, process.env.REFRESH_TOKEN_SECRET!)
}