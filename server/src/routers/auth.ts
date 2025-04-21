import { TRPCError } from "@trpc/server"
import { z } from "zod";
import { randomInt } from "crypto";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { redis } from "../redis.js";
import { publicProcedure, router } from "../trpc.js";
import { draftVerificationEmail } from "../utils/draftEmail.js";
import * as userService from "~/services/userService.js"
import * as authService from "~/services/authService.js";
import { compare } from "bcrypt";
import { UserCreateSchema, UserLoginSchema, UserResponseSchema } from "~/models/User.js";
import { getRedirectPath } from "~/utils/getRedirectPath.js";

export const authRouter = router({
    checkAvailability: publicProcedure.input(z.object({
        field: z.enum(["email", "username"]),
        value: z.string()
    }))
        .query(async ({ input }) => {
            const field = input.field === 'email' ? 'email' : 'usernameLower'
            try {
                const user = await userService.getUserBy(field, input.value);
                return { available: !user }
            }
            catch (error) {
                console.error(error);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Something Went wrong. Please try again later" })
            }
        }),

    signupUser: publicProcedure
        .input(UserCreateSchema)
        .mutation(async ({ input, ctx }) => {
            try {
                const { username, password, confirmPassword, email } = input
                if (password != confirmPassword)
                    throw new TRPCError({ code: 'BAD_REQUEST', message: "Passwords do not match" })

                const code = randomInt(999999).toString().padStart(6, '0')
                const user = await userService.createUser(email, password, username, code)

                redis.setex(`verification:${user.userId}`, 259200 /* 3 days */, code)
                    .catch(e => console.log(e))
                const { accessToken, cookie, firebaseToken: fb } = await authService.createTokens({ ...user, isUnverified: true })
                ctx.res.header('set-cookie', cookie)
                draftVerificationEmail(username, code, email)
                return ({ jwt: accessToken, redirect: '/auth/verify', fb })
            }
            catch (error) {
                if (error instanceof TRPCError)
                    throw error
                console.error(error)
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong." })
            }
        }),

    loginUser: publicProcedure
        .input(UserLoginSchema)
        .mutation(async ({ input, ctx }) => {
            await rateLimiter({
                userIdentifier: ctx.user?.userId ?? ctx.req.ip,
                limit: 5,
                window: 30,
                name: 'login'
            })
            try {
                const { email, password } = input;


                const row = await userService.getUserWithSensitiveInfoBy("email", email)

                if (!row)
                    throw new TRPCError({ code: 'BAD_REQUEST', message: "Invalid Credentials" })

                const { passwordHash, emailVerified, ...user } = row
                const valid = await compare(password, passwordHash);
                if (!valid)
                    throw new TRPCError({ code: 'BAD_REQUEST', message: "Invalid Credentials" })

                const u = UserResponseSchema.parse(user)

                const { accessToken, cookie, firebaseToken } = await authService.updateTokensAndLogin({...u, isUnverified: !emailVerified})
                let redirect = getRedirectPath(ctx.req.headers['x-client-url'])
                if (!row.emailVerified)
                    redirect = '/auth/verify'
                ctx.res.header('set-cookie', cookie)
                return { jwt: accessToken, redirect, firebaseToken }
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
            await authService.deleteTokens(refresh)
        res.clearCookie('rf')
        return
    })
});
