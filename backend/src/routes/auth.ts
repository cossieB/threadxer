import express from "express";
import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import { Account, User } from "../db/schema";
import { hash, genSalt, compare } from 'bcrypt'
import { eq } from "drizzle-orm";
import { validation as validate } from "../utils/validation";
import { createAccessToken, createRefreshToken } from "../utils/createJWT";
import { Redis } from "ioredis";
import cookie from 'cookie'; 

export const authRouter = express.Router();

const redis = new Redis()

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
        const row = await db.select({
            userId: Account.userId,
            passwordHash: Account.passwordHash
        })
            .from(Account)
            .where(eq(Account.email, email.toLowerCase()))
        if (row.length == 0)
            throw new AppError("Invalid Credentials", 400)
        const user = row[0]
        const valid = await compare(password, user.passwordHash);
        if (!valid)
            throw new AppError("Invalid Credentials", 400)
        const refreshToken = createRefreshToken(user.userId)
        const accessToken = createAccessToken(user.userId)
        await redis.set(`refresh:${refreshToken}`, user.userId);
        cookie.serialize('at', accessToken, {
            domain: '/',
            maxAge: 60 * 15,
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: true
        })
        return res.json({rf: refreshToken, at: accessToken})
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


authRouter.get('/test', async (req, res) => {
    const val = await redis.get('name');
    res.json({ val })
})