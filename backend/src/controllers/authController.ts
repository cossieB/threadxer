import AppError from "../utils/AppError";
import { db } from "../db/drizzle";
import type { Request, Response, NextFunction } from "express";
import { compare, genSalt, hash } from "bcrypt";
import { randomInt } from "crypto";
import { PostgresError } from "postgres";
import { RefreshTokens, User, VerificationCodes } from "../db/schema";
import { handleTokens } from "../utils/generateCookies";
import { eq } from "drizzle-orm";
import { draftVerificationEmail } from "../utils/draftEmail";
import { redis } from "../utils/redis";
import titleCase from "../lib/titleCase";

export async function checkAvailability(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, email } = req.body;
        if (!username && !email)
            throw new AppError("Please don't bypass client validation", 400);
        if (username) {
            if (typeof username != 'string')
                throw new AppError("Please don't bypass client validation", 400);

            const user = await db.query.User.findFirst({
                columns: {
                    username: true
                },
                where(fields, operators) {
                    return operators.eq(fields.usernameLower, username.toLowerCase());
                },
            });
            return res.json({ available: !user });
        }
        if (email) {
            if (typeof email != 'string')
                throw new AppError("Please don't bypass client validation", 400);

            const user = await db.query.User.findFirst({
                columns: {
                    username: true
                },
                where(fields, { eq }) {
                    return eq(fields.email, email.toLowerCase());
                },
            });
            return res.json({ available: !user });
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}

export async function signupUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, password, confirmPassword, email } = req.body as Record<string, string>;
        if (password != confirmPassword)
            throw new AppError("Please don't bypass client validation", 400)

        const displayName = titleCase(username.replaceAll('_', ' '))
        const code = randomInt(999999).toString().padStart(6, '0')
        const salt = await genSalt(10);
        const passwordHash = await hash(password, salt);
        const user = await db.transaction(async tx => {
            const row = await tx.insert(User)
                .values({
                    email: email.toLowerCase(),
                    username,
                    usernameLower: username.toLowerCase(),
                    passwordHash, 
                    displayName
                })
                .returning({
                    userId: User.userId,
                    username: User.username,
                    avatar: User.avatar,
                    banner: User.avatar,
                    email: User.email
                });
            await tx.insert(VerificationCodes)
                .values({
                    userId: row[0].userId,
                    code,
                })
            return row[0]
        })
        redis.setex(`verification:${user.userId}`, 259200, code)
            .catch(e => console.log(e))
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
}

export async function loginUser(req: Request, res: Response, next: NextFunction) {
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
                username: true, 
                email: true
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

        const { accessToken, cookie } = await handleTokens({ ...user, isUnverified: !emailVerified }, async refreshToken => {
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
        if (!row.emailVerified)
            redirect = '/auth/verify'
        res.header('Set-Cookie', cookie)
        return res.json({ jwt: accessToken, redirect })
    }
    catch (error) {
        next(error)
    }
}

export async function logoutUser(req: Request, res: Response, next: NextFunction) {
    const refresh = req.cookies.rf;
    if (refresh)
        await db.delete(RefreshTokens).where(eq(RefreshTokens.token, refresh))
    res.clearCookie('rf')
    return res.sendStatus(200)
}