import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { postsPerPage } from "~/config/variables.js";
import * as postService from "~/services/postService.js";
import * as authService from "~/services/authService.js";
import * as userService from "~/services/userService.js";
import { router, publicProcedure, protectedProcedure } from "~/trpc.js";
import { formatPosts } from "~/utils/formatPosts.js";
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { UpdateUserSchema } from "~/models/User.js";

export const userRouter = router({

    getUser: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const row = await userService.getUserBy('usernameLower', input)
            if (!row)
                throw new TRPCError({ code: 'NOT_FOUND', message: 'No user with that username exists' })
            return row
        }),

    updateUser: protectedProcedure
        .input(UpdateUserSchema)
        .mutation(async ({ ctx, input }) => {
            if (Object.keys(input).length === 0)
                throw new TRPCError({ code: 'BAD_REQUEST', message: "Empty request body" })

            const refresh = ctx.req.cookies.rf;
            if (!refresh)
                throw new TRPCError({ code: "UNAUTHORIZED", message: "No request token" })
            const token = jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;

            try {
                const { accessToken, cookie, firebaseToken: fb } = await authService.updateTokensAndUser({ ...token.user!, ...input }, refresh, input)
                ctx.res.header('Set-Cookie', cookie)
                return { jwt: accessToken, fb }
            }
            catch (error) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later." })
            }
        }),

    getUserPosts: publicProcedure
        .input(z.object({
            username: z.string(),
            page: z.number().optional().default(0)
        }))
        .query(async ({ ctx, input }) => {
            const username = input.username.toLowerCase()
            const posts = await postService.getUserPosts(username, ctx.user, input.page)
            return {
                posts: posts.map(formatPosts).slice(0, postsPerPage),
                isLastPage: posts.length < postsPerPage + 1
            }
        }),

    getUserReplies: publicProcedure
        .input(z.object({
            username: z.string(),
            page: z.number().optional().default(0)
        }))
        .query(async ({ ctx, input }) => {

            const posts = await postService.getUserReplies(input.username.toLowerCase(), ctx.user, input.page)

            return {
                posts: posts.map(formatPosts).slice(0, postsPerPage),
                isLastPage: posts.length < postsPerPage + 1
            }
        }),

    getUserLikes: publicProcedure
        .input(z.object({
            username: z.string(),
            page: z.number().optional().default(0)
        }))
        .query(async ({ ctx, input }) => {
            const posts = await postService.getUserLikes(input.username.toLowerCase(), ctx.user, input.page)
            return {
                posts: posts.map(formatPosts).slice(0, postsPerPage),
                isLastPage: posts.length < postsPerPage + 1
            }
        }),

    getUserMedia: publicProcedure
        .input(z.object({
            username: z.string(),
            page: z.number().optional().default(0)
        }))
        .query(async ({ ctx, input }) => {
            try {
                return postService.getUserMedia(input.username.toLowerCase(), input.page)
            }
            catch (error) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later." })
            }
        })
})