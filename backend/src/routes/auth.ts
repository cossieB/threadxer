import express from "express";
import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import { User, VerificationCodes } from "../db/schema";
import { hash, genSalt, compare } from 'bcrypt'
import { DrizzleError, eq } from "drizzle-orm";
import { validation as validate } from "../utils/validation";
import cookie from 'cookie';
import { redis } from "../utils/redis";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { generateCookies } from "../utils/generateCookies";
import { PostgresError } from "postgres";
import { randomInt } from "crypto";
import { draftVerificationEmail } from "../utils/draftEmail";

export const authRouter = express.Router();

authRouter.post('/availability', async (req, res, next) => {
    try {
        const { username, email } = req.body;
        if (!username && !email)
            throw new AppError("Please don't bypass client validation", 400)
        if (username) {
            if (typeof username != 'string')
                throw new AppError("Please don't bypass client validation", 400)

            const row = await db.select({
                username: User.username
            })
                .from(User)
                .where(eq(User.usernameLower, username.toLowerCase()))
                .limit(1)

            return res.json({ available: row.length === 0 })
        }
        if (email) {
            if (typeof email != 'string')
                throw new AppError("Please don't bypass client validation", 400)

            const row = await db.select({
                email: User.email
            })
                .from(User)
                .where(eq(User.email, email.toLowerCase()))
                .limit(1)

            return res.json({ available: row.length === 0 })
        }
    }
    catch (error) {
        console.log(error)
        next(error)
    }
})

authRouter.post('/signup', async (req, res, next) => {
    try {
        const { username, password, confirmPassword, email } = req.body;
        if (
            !username ||
            typeof username !== 'string' ||
            !password ||
            typeof password !== 'string' ||
            !confirmPassword ||
            typeof confirmPassword !== 'string' ||
            !email ||
            typeof email !== 'string'
        )
            throw new AppError("Please don't bypass client validation", 400)
        if (password != confirmPassword)
            throw new AppError("Please don't bypass client validation", 400)

        const errors = validate(username, password, confirmPassword, email);
        if (Object.values(errors).flat().length > 0)
            throw new AppError("Please don't bypass client validation", 400)
        const salt = await genSalt(10);
        const passwordHash = await hash(password, salt);
        const code = randomInt(999999).toString().padStart(6, '0')
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
                    email: User.email,
                    avatar: User.avatar,
                    banner: User.avatar
                })
            await tx.insert(VerificationCodes)
                .values({
                    userId: row[0].userId,
                    code
                })
            return row[0]
        })
        draftVerificationEmail(username, code, email)
        return res.status(201).json(user)
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
authRouter.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (
            !email ||
            typeof email !== 'string' ||
            !password ||
            typeof password !== 'string'
        )
            throw new AppError("Please don't bypass client validation", 400)
        const row = await db.update(User)
            .set({ lastLogin: new Date() })
            .where(eq(User.email, email))
            .returning({
                userId: User.userId,
                passwordHash: User.passwordHash,
                username: User.username,
                email: User.email,
                avatar: User.avatar,
                banner: User.avatar
            })
        if (row.length == 0)
            throw new AppError("Invalid Credentials", 400)

        const { passwordHash, ...user } = row[0]
        const valid = await compare(password, passwordHash);
        if (!valid)
            throw new AppError("Invalid Credentials", 400)

        const { accessCookie, refreshCookie, jwt } = await generateCookies(user);

        res.header('Set-Cookie', [accessCookie, refreshCookie])
        return res.json({ jwt })
    }
    catch (error) {
        next(error)
    }
})
authRouter.get('/confirm_email', async (req, res, next) => {
    const { userId } = res.locals.user as { userId: string }
    try {
        await db.update(User)
            .set({
                emailVerified: new Date()
            })
            .where(eq(User.userId, userId))
        return res.sendStatus(200)
    } catch (error) {
        next(error)
    }
})

authRouter.get('/refresh', async (req, res, next) => {
    const refresh = cookie.parse(req.headers.cookie ?? "").rf;
    if (!refresh)
        return next(new AppError('No Token', 401))
    const isValid = await redis.del(`refresh:${refresh}`);
    if (!isValid)
        return next(new AppError('Invalid Token', 403))
    const token = jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload
    const { accessCookie, refreshCookie } = await generateCookies(token.user);
    res.header('Set-Cookie', [accessCookie, refreshCookie])
    return res.json({ user: token.user, exp: token.exp })
})

authRouter.delete('/logout', async (req, res, next) => {
    const refresh = cookie.parse(req.headers.cookie ?? "").rf;
    if (refresh)
        await redis.del(`refresh:${refresh}`);
    res.clearCookie('rf')
    res.clearCookie('at')
    return res.sendStatus(200)
})