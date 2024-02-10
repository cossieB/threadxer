import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { db } from "../db/drizzle";
import { TRPCError } from "@trpc/server";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { validateUrl } from "../lib/validateUrl";
import { and, eq, desc, isNotNull } from "drizzle-orm";
import { Media, Post, RefreshTokens, User } from "../db/schema";
import { handleTokens } from "../utils/generateCookies";
import { getPostsAndReposts } from "../queries/getPostsAndReposts";
import { formatPosts } from "../utils/formatPosts";
import { getPosts } from "../queries/getPosts";
import { getLikes } from "../queries/getLikes";

export const userRouter = router({

    getUser: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const row = await db.query.User.findFirst({
                columns: {
                    passwordHash: false,
                    emailVerified: false,
                    usernameLower: false,
                    email: false,
                    userId: false,
                    lastLogin: false
                },
                where(fields, operators) {
                    return operators.eq(fields.usernameLower, input.toLowerCase())
                },
            })
            if (!row)
                throw new TRPCError({ code: 'NOT_FOUND', message: 'No user with that username exists' })
            return row
        }),

    updateUser: protectedProcedure
        .input(z.object({
            displayName: z.string().max(25).optional(),
            bio: z.string().max(180).optional(),
            website: z.string().url().optional(),
            location: z.string().optional(),
            avatar: z.string().url().optional(),
            banner: z.string().url().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            if (Object.keys(input).length === 0)
                throw new TRPCError({ code: 'BAD_REQUEST', message: "Empty request body" })

            const refresh = ctx.req.cookies.rf;
            if (!refresh)
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Not request token" })
            const token = jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;

            try {
                const user = ctx.user;
                if (input.website && !validateUrl(input.website))
                    throw new TRPCError({ code: 'BAD_REQUEST', message: "Please don't bypass client validation" })

                const { accessToken, cookie, fb } = await handleTokens({ ...token.user, ...input }, async refreshToken => {
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
            const posts = await query;
            return posts.map(formatPosts)
        }),

    getUserReplies: publicProcedure
        .input(z.object({
            username: z.string(),
            page: z.number().optional().default(0)
        }))
        .query(async ({ ctx, input }) => {
            const postsPerPage = 100
            const query = getPosts(ctx.user?.userId);
            query
                .where(
                    and(
                        isNotNull(Post.replyTo),
                        eq(User.usernameLower, input.username.toLowerCase())
                    )
                ).limit(postsPerPage)
                .offset(input.page * postsPerPage)
                .orderBy(desc(Post.dateCreated));

            const posts = await query
            return posts.map(formatPosts)
        }),

    getUserLikes: publicProcedure
        .input(z.object({
            username: z.string(),
            page: z.number().optional().default(0)
        }))
        .query(async ({ctx, input}) => {
            const posts = await getLikes(input.username, ctx.user);
            return posts.map(formatPosts)
        }),

    getUserMedia: publicProcedure
        .input(z.object({
            username: z.string(),
            page: z.number().optional().default(0)
        }))
        .query(async ({ctx, input}) => {
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
                    .orderBy(desc(Post.dateCreated))
        
                return media
            }
            catch (error) {
                throw new TRPCError({code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later."})
            }
        })
})