import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { postsPerPage } from "~/config/variables.js";
import { db } from "~/db/drizzle.js";
import { RefreshTokens, User, Post, Media } from "~/db/schema.js";
import { getLikes } from "~/queries/getLikes.js";
import { getPosts } from "~/queries/getPosts.js";
import { getPostsAndReposts } from "~/queries/getPostsAndReposts.js";
import * as authService from "~/services/authService.js";
import * as userService from "~/services/userService.js";
import { router, publicProcedure, protectedProcedure } from "~/trpc.js";
import { formatPosts } from "~/utils/formatPosts.js";
import jwt, {type JwtPayload} from 'jsonwebtoken'
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
                const user = ctx.user;

                const { accessToken, cookie, firebaseToken: fb } = await authService.handleTokens({ ...token.user, ...input }, async refreshToken => {
                    await db.transaction(async tx => {
                        await tx.delete(RefreshTokens).where(eq(RefreshTokens.token, refresh))
                        await tx.insert(RefreshTokens).values({
                            token: refreshToken,
                            userId: token.user.userId
                        })
                        await tx
                            .update(User)
                            .set({ ...input })
                            .where(eq(User.userId, user.userId))
                    })
                })
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
            const query = getPostsAndReposts(username, ctx.user)
                .limit(postsPerPage + 1)
                .offset(input.page * postsPerPage)

                const posts = await query
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

            const query = getPosts(ctx.user?.userId);
            query
                .where(
                    and(
                        isNotNull(Post.replyTo),
                        eq(User.usernameLower, input.username.toLowerCase())
                    )
                )
                .limit(postsPerPage + 1)
                .offset(input.page * postsPerPage)
                .orderBy(desc(Post.dateCreated));

                const posts = await query
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
            const query = getLikes(input.username, ctx.user)
                .limit(postsPerPage + 1)
                .offset(postsPerPage * input.page)

                const posts = await query
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
                const media = await db.select({
                    url: Media.url,
                    is_video: Media.isVideo,
                    postId: Media.postId,
                })
                    .from(Media)
                    .innerJoin(Post, eq(Media.postId, Post.postId))
                    .innerJoin(User, eq(Post.userId, User.userId))
                    .where(eq(User.usernameLower, input.username.toLowerCase()))
                    .limit(100)
                    .offset(input.page * postsPerPage)
                    .orderBy(desc(Post.dateCreated))

                return media
            }
            catch (error) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later." })
            }
        })
})