import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc.js";
import { redis } from "../redis.js";
import * as authService from "~/services/authService.js";
import * as verificationService from "~/services/verificationService.js";
import * as emailService from "~/services/emailService.js";

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
                const row = await verificationService.getVerificationCode(ctx.user)
                if (!row)
                    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Error. Please click "resend".' })
                if (row.expiry < new Date) {
                    await verificationService.createNewVerificationCode(ctx.user, emailService.draftVerificationEmail)
                    throw new TRPCError({ code: 'BAD_REQUEST', message: "Code expired. Check your email for a new code." })
                }
                await redis.setex(`verification:${ctx.user.userId}`, 259200, row.code)
                storedCode = row.code
            }
            try {
                if (storedCode !== input)
                    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid Code' })
                
                await verificationService.verifyUser(ctx.user, ctx.req.cookies.rf)

                const { accessToken: newAccessToken, cookie, firebaseToken} = await authService.newRefreshToken(ctx.user, ctx.req.cookies.rf ?? "")
                ctx.res.header('Set-Cookie', cookie)
                return { jwt: newAccessToken, firebaseToken }
            } 
            catch (error) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later." })
            }
        }),

    resendToken: protectedProcedure
        .mutation(async ({ ctx }) => {
            if (!ctx.user.isUnverified)
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already Verified' })
            try {
                await verificationService.createNewVerificationCode(ctx.user, emailService.draftVerificationEmail)
                return
            }
            catch (error) {
                if (error instanceof TRPCError) 
                    throw error
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later." })
            }
        })
})