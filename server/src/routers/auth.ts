import { rateLimiter } from "../middleware/rateLimiter";
import { publicProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server"
import { z } from "zod";
import { db } from "../db/drizzle";
import { randomInt } from "crypto";
import { PostgresError } from "postgres";
import { RefreshTokens, User, VerificationCodes } from "../db/schema";
import titleCase from "../lib/titleCase";
import { redis } from "../redis";
import { draftVerificationEmail } from "../utils/draftEmail";
import { handleTokens } from "../utils/generateCookies";
import { compare, genSalt, hash } from "bcrypt";
import { eq } from "drizzle-orm";

export const authRouter = router({

    checkAvailability: publicProcedure.input(z.object({
        field: z.enum(["email", "username"]),
        value: z.string()
    }))
        .query(async ({ input }) => {
            const field = input.field === 'email' ? 'email' : 'usernameLower'
            try {
                const user = await db.query.User.findFirst({
                    columns: {
                        username: true
                    },
                    where(fields, operators) {
                        return operators.eq(fields[field], input.value.toLowerCase());
                    },
                });
                return { available: !user }
            }
            catch (error) {
                console.error(error);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Something Went wrong. Please try again later" })
            }
        }),

    signupUser: publicProcedure.input(
        z.object({
            username: z.string(),
            password: z.string(),
            confirmPassword: z.string(),
            email: z.string().email()
        })
    )
        .mutation(async ({ input, ctx }) => {
            try {
                ctx.req
                const { username, password, confirmPassword, email } = input
                if (password != confirmPassword)
                    throw new TRPCError({ code: 'BAD_REQUEST', message: "Passwords do not match" })

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
                const { accessToken, cookie, fb } = await handleTokens({ ...user, isUnverified: true })
                ctx.res.header('set-cookie', cookie)
                draftVerificationEmail(username, code, email)
                return ({ jwt: accessToken, redirect: '/auth/verify', fb })
            }
            catch (error) {
                if (error instanceof PostgresError) {
                    if (error.message.includes('users_username_unique'))
                    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Username is not available' })
                if (error.message.includes("users_email_unique"))
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email is not available' })
        }
        console.error(error)
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong." })
            }
        }),

    loginUser: publicProcedure.input(z.object({
        email: z.string(),
        password: z.string()
    }))
        .mutation(async ({ input, ctx }) => {
            await rateLimiter({
                ctx,
                limit: 5,
                window: 30,
                name: 'login'
            })
            try {
                const { email, password } = input;
                let redirect: string | undefined
                try {
                    const url = new URL(ctx.req.headers['x-client-url'] as string ?? "")
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
                    throw new TRPCError({ code: 'BAD_REQUEST', message: "Invalid Credentials" })

                const { passwordHash, emailVerified, ...user } = row
                const valid = await compare(password, passwordHash);
                if (!valid)
                    throw new TRPCError({ code: 'BAD_REQUEST', message: "Invalid Credentials" })

                const { accessToken, cookie, fb } = await handleTokens({ ...user, isUnverified: !emailVerified }, async refreshToken => {
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
                ctx.res.header('Set-Cookie', cookie)
                return { jwt: accessToken, redirect, fb }
            }
            catch (error) {
                if (error instanceof TRPCError) throw error
                console.error(error)
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later" })
            }
        }),

    logoutUser: publicProcedure.mutation(async ({ ctx: { req, res } }) => {
        const refresh = req.cookies.rf;
        if (refresh)
            await db.delete(RefreshTokens).where(eq(RefreshTokens.token, refresh))
        res.clearCookie('rf')
        return
    })
});
