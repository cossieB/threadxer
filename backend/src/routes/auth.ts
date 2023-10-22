import express from "express";
import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import { Account, User } from "../db/schema";
import { hash, genSalt, compare } from 'bcrypt'
import { eq } from "drizzle-orm";
import { validation as validate } from "../utils/validation";
import cookie from 'cookie';
import { redis } from "../utils/redis";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { generateCookies } from "../utils/generateCookies";

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
                username: Account.username
            })
                .from(Account)
                .where(eq(Account.usernameLower, username.toLowerCase()))
                .limit(1)

            return res.json({ available: row.length === 0 })
        }
        if (email) {
            if (typeof email != 'string')
                throw new AppError("Please don't bypass client validation", 400)

            const row = await db.select({
                email: Account.email
            })
                .from(Account)
                .where(eq(Account.email, email.toLowerCase()))
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
        const passwordHash = await hash(password, salt)
        const row = await db.insert(Account)
            .values({
                email: email.toLowerCase(),
                username,
                usernameLower: username.toLowerCase(),
                passwordHash
            })
            .returning({
                userId: Account.userId
            })
        return res.status(201).json({ userId: row[0]?.userId })
    }
    catch (error) {
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
        const row = await db.update(Account)
            .set({ lastLogin: new Date() })
            .where(eq(Account.email, email))
            .returning({
                userId: Account.userId,
                passwordHash: Account.passwordHash
            })
        if (row.length == 0)
            throw new AppError("Invalid Credentials", 400)

        const user = row[0]
        const valid = await compare(password, user.passwordHash);
        if (!valid)
            throw new AppError("Invalid Credentials", 400)

        const { accessCookie, refreshCookie } = await generateCookies(user.userId);

        res.header('Set-Cookie', [accessCookie, refreshCookie])
        return res.sendStatus(200)
    }
    catch (error) {
        next(error)
    }
})
authRouter.get('/confirm_email', async (req, res, next) => {
    const { userId } = res.locals as { userId: string }
    try {
        await db.transaction(async tx => {
            await tx.update(Account)
                .set({
                    emailVerified: new Date()
                })
                .where(eq(Account.userId, userId))
            await tx.insert(User)
                .values({ userId })
        })
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
    const { accessCookie, refreshCookie } = await generateCookies(token.userId);
    res.header('Set-Cookie', [accessCookie, refreshCookie])
    return res.sendStatus(200)
})

authRouter.delete('/logout', async (req, res, next) => {
    const refresh = cookie.parse(req.headers.cookie ?? "").rf; 
    if (refresh)
        await redis.del(`refresh:${refresh}`); 
    res.clearCookie('rf')
    res.clearCookie('at')
    return res.sendStatus(200)
})