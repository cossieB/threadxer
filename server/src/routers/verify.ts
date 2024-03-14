import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import postgres from 'postgres';
import { db } from "../db/drizzle.js";
import { User, RefreshTokens, VerificationCodes } from "../db/schema.js";
import { protectedProcedure, router } from "../trpc.js";
import { randomInt } from "crypto";
import { redis } from "../redis.js";
import { draftVerificationEmail } from "../utils/draftEmail.js";
import { handleTokens } from "../utils/generateCookies.js";

export const verificationRouter = router({
    verifyUser: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            if (!ctx.user.isUnverified)
                throw new TRPCError({ code: 'BAD_REQUEST', message: "Already verified" })
            let storedCode: string;
            const cachedCode = await redis.get(`verification:${ctx.user.userId}`)
            if (cachedCode)
                storedCode = cachedCode
            else {
                const row = await db.query.VerificationCodes.findFirst({
                    where(fields, operators) {
                        return operators.eq(fields.userId, ctx.user.userId)
                    }
                })
                if (!row)
                    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Error. Please click "resend".' })
                if (row.expiry < new Date) {
                    const code = randomInt(999999).toString().padStart(6, '0');
                    await Promise.all([
                        db
                            .update(VerificationCodes)
                            .set({
                                code,
                                expiry: sql`NOW() + INTERVAL '72 hours'`
                            })
                            .where(eq(VerificationCodes.userId, ctx.user.userId)),
                        redis.setex(`verification:${ctx.user.userId}`, 259200, code)
                    ])
                    draftVerificationEmail(ctx.user.username, code, ctx.user.email)
                    throw new TRPCError({ code: 'BAD_REQUEST', message: "Code expired. Check your email for a new code." })
                }
                await redis.setex(`verification:${ctx.user.userId}`, 259200, row.code)
                storedCode = row.code
            }
            try {
                if (storedCode !== input)
                    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid Code' })
                const now = new Date;
                await db.transaction(async tx => {
                    await tx.update(User)
                        .set({
                            emailVerified: now
                        })
                        .where(eq(User.userId, ctx.user.userId))
                    await tx.update(VerificationCodes)
                        .set({
                            dateUsed: now
                        })
                    if (ctx.req.cookies.rf)
                        await tx.delete(RefreshTokens).where(eq(RefreshTokens.token, ctx.req.cookies.rf))
                })
                const { accessToken: newAccessToken, cookie, fb } = await handleTokens({ ...ctx.user, isUnverified: false }, async refreshToken => {
                    await db.transaction(async tx => {
                        if (ctx.req.cookies.rf)
                            await tx.delete(RefreshTokens).where(eq(RefreshTokens.token, ctx.req.cookies.rf))
                        await tx.insert(RefreshTokens).values({
                            token: refreshToken,
                            userId: ctx.user.userId
                        })
                    })
                })
                ctx.res.header('Set-Cookie', cookie)
                return { jwt: newAccessToken, fb }
            } 
            catch (error) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later." })
            }
        }),

    resendToken: protectedProcedure
        .mutation(async ({ ctx }) => {
            const code = randomInt(999999).toString().padStart(6, '0');
            if (!ctx.user.isUnverified)
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already Verified' })
            try {
                await db.insert(VerificationCodes)
                    .values({
                        userId: ctx.user.userId,
                        code,
                    })
                    .onConflictDoUpdate({
                        target: VerificationCodes.userId,
                        set: {
                            code,
                            expiry: sql`NOW() + INTERVAL '72 hours'`
                        }
                    })
                draftVerificationEmail(ctx.user.username, code, ctx.user.email)
                return
            }
            catch (error) {
                if (error instanceof postgres.PostgresError) {
                    if (error.message.includes("violates foreign key constraint"))
                        throw new TRPCError({ code: 'BAD_REQUEST', message: "User Not Found" })
                }
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later." })
            }
        })
})