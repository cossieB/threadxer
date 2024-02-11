import { protectedProcedure, publicProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getHashtags } from "../utils/getHashtags";
import { db } from "../db/drizzle";
import { eq, desc, isNull } from "drizzle-orm";
import { Post, Media, Hashtags, User, Likes } from "../db/schema";
import { getPosts } from '../queries/getPosts';
import { PostgresError } from 'postgres';
import { formatPosts } from '../utils/formatPosts';
import { postRepliesQuery } from '../queries/postRepliesQuery';

export const postRouter = router({
    createPost: protectedProcedure
        .input(z.object({
            text: z.string().max(180),
            quotedPost: z.string().uuid().optional(),
            replyTo: z.string().uuid().optional(),
            media: z.object({
                url: z.string().url(),
                isVideo: z.boolean(),
                ref: z.string()
            }).array().optional().default([]),
        }))
        .mutation(async ({ ctx, input }) => {
            if (input.text.length + input.media.length === 0)
                throw new TRPCError({ code: 'BAD_REQUEST', message: "Empty posts are not allowed" })

            const uniques = getHashtags(input.text);

            try {
                const postId = await db.transaction(async tx => {
                    const row = await tx.insert(Post)
                        .values({
                            userId: ctx.user.userId,
                            text: input.text.trim(),
                            quotedPost: input.quotedPost,
                            didQuote: !!input.quotedPost,
                            replyTo: input.replyTo,
                            didReply: !!input.replyTo
                        }).returning({
                            postId: Post.postId
                        })
                    if (input.media.length > 0)
                        await tx.insert(Media).values(input.media.map(m => ({
                            postId: row[0].postId,
                            url: m.url,
                            firebaseRef: m.ref,
                            isVideo: m.isVideo,
                        })))
                    if (uniques.length > 0)
                        await tx.insert(Hashtags).values(uniques.map(tag => ({
                            hashtag: tag,
                            postId: row[0].postId,
                        })))
                    return row[0].postId
                })
                ctx.res.status(201)
                return postId
            }
            catch (error) {
                console.error(error)
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
            }
        }),
    getPost: publicProcedure.input(z.string())
        .query(async ({ ctx, input }) => {
            try {
                const query = getPosts(ctx.user?.userId)
                query.where(eq(Post.postId, input))

                const posts = await query
                const post = posts.at(0);
                if (!post)
                    throw new TRPCError({ code: 'NOT_FOUND', message: "That post doesn't exist" })
                return formatPosts(post)
            }
            catch (error) {
                if (error instanceof PostgresError && error.message.includes("invalid input syntax for type uuid"))
                    throw new TRPCError({ code: 'BAD_REQUEST', message: "That post doesn't exist" })
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later" })
            }
        }),
    getAllPosts: publicProcedure
        .input(z.object({
            page: z.number().optional().default(0)
        }))
        .query(async ({ ctx, input }) => {
            const postsPerPage = 100
            const query = getPosts(ctx.user?.userId);
            query
                .where(isNull(Post.replyTo))
                .limit(postsPerPage)
                .offset(input.page * postsPerPage)
                .orderBy(desc(Post.dateCreated));
            const posts = await query

            return posts.map(formatPosts)
        }),
    getPostReplies: publicProcedure
        .input(z.object({
            postId: z.string().uuid(),
            page: z.number().default(0)
        }))
        .query(async ({ ctx, input }) => {
            try {
                const query = postRepliesQuery(ctx.user?.userId)
                query
                    .where(eq(Post.replyTo, input.postId))
                    .orderBy(desc(Post.dateCreated))

                const posts = await query;
                return posts.map(formatPosts)
            }
            catch (error) {
                if (error instanceof PostgresError && error.message.includes("invalid input syntax for type uuid"))
                    throw new TRPCError({ code: 'BAD_REQUEST', message: "That post doesn't exist" })
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later" })
            }
        }),
    getPostQuotes: publicProcedure
        .input(z.object({
            postId: z.string().uuid(),
            page: z.number().default(0)
        }))
        .query(async ({ ctx, input }) => {
            try {
                const query = postRepliesQuery(ctx.user?.userId)
                query
                    .where(eq(Post.quotedPost, input.postId))
                    .orderBy(desc(Post.dateCreated))

                const posts = await query;
                return posts.map(formatPosts)
            }
            catch (error) {
                if (error instanceof PostgresError && error.message.includes("invalid input syntax for type uuid"))
                    throw new TRPCError({ code: 'BAD_REQUEST', message: "That post doesn't exist" })
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later" })
            }
        }),
    getPostLikes: publicProcedure
        .input(z.object({
            postId: z.string().uuid(),
            page: z.number().default(0)
        }))
        .query(async ({ctx, input}) => {
            try {
                const users = await db.select({
                    userId: User.userId,
                    username: User.username,
                    avatar: User.avatar,
                    banner: User.avatar,
                    displayName: User.displayName,
                    bio: User.bio
                })
                    .from(Likes)
                    .innerJoin(User, eq(Likes.userId, User.userId))
                    .where(eq(Likes.postId, input.postId))
                return users
            }
            catch (error) {
                if (error instanceof PostgresError && error.message.includes("invalid input syntax for type uuid"))
                    throw new TRPCError({code: 'BAD_REQUEST', message: "That post doesn't exist"})
                throw new TRPCError({code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later"})
            }
        })
})