import express from "express";
import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import { RefreshTokens, User, VerificationCodes } from "../db/schema";
import { hash, genSalt, compare } from 'bcrypt'
import { DrizzleError, eq, sql } from "drizzle-orm";
import { validation as validate } from "../utils/validation";
import cookie from 'cookie';
import { redis } from "../utils/redis";
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { PostgresError } from "postgres";
import { randomInt } from "crypto";
import { draftVerificationEmail } from "../utils/draftEmail";
import { validation } from "../middleware/validation";
import { authorize } from "../middleware/authenticate";
import { rateLimiter } from "../middleware/rateLimiter";
import { handleTokens } from "../utils/generateCookies";

export const authRouter = express.Router();

authRouter.post('/availability', async (req, res, next) => {
    try {
        const { username, email } = req.body;
        if (!username && !email)
            throw new AppError("Please don't bypass client validation", 400)
        if (username) {
            if (typeof username != 'string')
                throw new AppError("Please don't bypass client validation", 400)

            const user = await db.query.User.findFirst({
                columns: {
                    username: true
                },
                where({ usernameLower }, { eq }) {
                    return eq(usernameLower, username.toLowerCase())
                },
            })
            return res.json({ available: !user })
        }
        if (email) {
            if (typeof email != 'string')
                throw new AppError("Please don't bypass client validation", 400)

            const user = await db.query.User.findFirst({
                columns: {
                    username: true
                },
                where(fields, { eq }) {
                    return eq(fields.email, email.toLowerCase())
                },
            })
            return res.json({ available: !user })
        }
    }
    catch (error) {
        console.log(error)
        next(error)
    }
})

authRouter.post('/signup', validation(['username', 'password', 'confirmPassword', 'email']), async (req, res, next) => {
    try {
        const { username, password, confirmPassword, email } = req.body as Record<string, string>;
        if (password != confirmPassword)
            throw new AppError("Please don't bypass client validation", 400)

        const errors = validate(username, password, confirmPassword, email);
        if (Object.values(errors).flat().length > 0)
            throw new AppError("Please don't bypass client validation", 400)

        const code = randomInt(999999).toString().padStart(6, '0')
        const salt = await genSalt(10);
        const passwordHash = await hash(password, salt);
        const user = await db.transaction(async tx => {
            const row = await tx.insert(User)
                .values({
                    email: email.toLowerCase(),
                    username,
                    usernameLower: username.toLowerCase(),
                    passwordHash
                })
                .returning({
                    userId: User.userId,
                    username: User.username,
                    avatar: User.avatar,
                    banner: User.avatar
                });
            await tx.insert(VerificationCodes)
                .values({
                    userId: row[0].userId,
                    code,
                })
            return row[0]
        })
        const { accessToken, cookie } = await handleTokens({ ...user, isUnverified: true })
        res.header('Set-Cookie', cookie)
        // draftVerificationEmail(username, code, email)
        return res.status(201).json({ jwt: accessToken, redirect: '/auth/verify' })
    }
    catch (error) {
        if (error instanceof PostgresError) {
            if (error.message.includes('users_username_unique'))
                return next(new AppError('Username is not available', 400))
            if (error.message.includes("users_email_unique"))
                return next(new AppError('Email is not available', 400))
        }
        next(error)
    }
})
authRouter.post('/login', rateLimiter('login', 5, 300), validation(['email', 'password']), async (req, res, next) => {
    try {
        const { email, password } = req.body as Record<string, string>;
        let redirect = "/"
        try {
            const url = new URL(req.get('Referrer') ?? "")
            if (url.searchParams.get('redirect'))
                redirect = url.searchParams.get('redirect')!
        } catch (_) { }
        const row = await db.query.User.findFirst({
            columns: {
                avatar: true,
                banner: true,
                passwordHash: true,
                emailVerified: true,
                userId: true,
                username: true
            },
            where(fields, operators) {
                return operators.eq(fields.email, email.toLowerCase())
            },
        })
        if (!row)
            throw new AppError("Invalid Credentials", 400)

        const { passwordHash, emailVerified, ...user } = row
        const valid = await compare(password, passwordHash);
        if (!valid)
            throw new AppError("Invalid Credentials", 400)

        const {accessToken, cookie} = await handleTokens({ ...user, isUnverified: true })
        if (!row.emailVerified)
            redirect = '/auth/verify'
        res.header('Set-Cookie', cookie)
        return res.json({ jwt: accessToken, redirect })
    }
    catch (error) {
        next(error)
    }
})
authRouter.post('/verify', authorize, validation(['code']), async (req, res, next) => {
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
        // draftVerificationEmail(token.user.username, code, token.user.email)
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
        const {accessToken: newAccessToken, cookie} = await handleTokens({...oldAccessToken.user, isUnverified: false}, async refreshToken => {
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
})
authRouter.get('/resend', authorize, async (req, res, next) => {
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
        // draftVerificationEmail(token.user.username, code, token.user.email)
        res.sendStatus(200)
    }
    catch (error) {
        if (error instanceof PostgresError) {
            if (error.message.includes("violates foreign key constraint"))
                return next(new AppError("User Not Found", 400))
        }
        next(error)
    }
})
authRouter.get('/refresh', async (req, res, next) => {
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
        const {accessToken, cookie} = await handleTokens(token.user, async refreshToken => {
            await db.transaction(async tx => {
                await tx.delete(RefreshTokens).where(eq(RefreshTokens.token, refresh))
                await tx.insert(RefreshTokens).values({
                    token: refreshToken,
                    userId: token.user.userId
                })
            })
        })
        res.setHeader('Set-Cookie', cookie)
        return res.json({ jwt: accessToken })
    }
    catch (error: any) {
        console.log(error)
        next(error)
    }
})

authRouter.delete('/logout', async (req, res, next) => {
    const refresh = req.cookies.rf;
    if (refresh)
        await db.delete(RefreshTokens).where(eq(RefreshTokens.token, refresh))
    res.clearCookie('rf')
    return res.sendStatus(200)
})