import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, isNull } from "drizzle-orm";
import postgres from 'postgres';
import { postsPerPage } from "../config/variables.js";
import { db } from "../db/drizzle.js";
import { postRepliesQuery } from "../queries/postRepliesQuery.js";
import { protectedProcedure, publicProcedure, router } from "../trpc.js";
import { formatPosts } from "../utils/formatPosts.js";
import { CreatePostSchema } from "~/models/Post.js";
import * as postService from "~/services/postService.js";

export const postRouter = router({
    createPost: protectedProcedure
        .input(CreatePostSchema)
        .mutation(async ({ ctx, input }) => {
            if (input.text.length + input.media.length === 0)
                throw new TRPCError({ code: 'BAD_REQUEST', message: "Empty posts are not allowed" })

            try {
                const postId = await postService.createPost(ctx.user, input)
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
                const post = await postService.getPost(input, ctx.user)
                if (!post)
                    throw new TRPCError({ code: 'NOT_FOUND', message: "That post doesn't exist" })
                return formatPosts(post)
            }
            catch (error) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later" })
            }
        }),

    getAllPosts: publicProcedure
        .input(z.object({
            page: z.number().optional().default(0)
        }))
        .query(async ({ ctx, input }) => {
            const posts = await postService.getAllPosts(input.page, ctx.user)
            return {
                posts: posts.map(formatPosts).slice(0, postsPerPage),
                isLastPage: posts.length < postsPerPage + 1
            }
        }),

    getPostReplies: publicProcedure
        .input(z.object({
            postId: z.string().uuid(),
            page: z.number().default(0)
        }))
        .query(async ({ ctx, input }) => {
            try {
                const posts = await postService.getPostReplies(input.postId, input.page, ctx.user)
                return {
                    posts: posts.map(formatPosts).slice(0, postsPerPage),
                    isLastPage: posts.length < postsPerPage + 1
                }
            }
            catch (error) {
                if (error instanceof TRPCError)
                    throw error
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
                const posts = await postService.getPostQuotes(input.postId, input.page, ctx.user)
                return {
                    posts: posts.map(formatPosts).slice(0, postsPerPage),
                    isLastPage: posts.length < postsPerPage + 1
                }
            }
            catch (error) {
                if (error instanceof TRPCError)
                    throw error
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later" })
            }
        }),

    getPostLikes: publicProcedure
        .input(z.object({
            postId: z.string().uuid(),
            page: z.number().default(0)
        }))
        .query(async ({ ctx, input }) => {
            try {
                const users = await postService.getPostLikes(input.postId, input.page, ctx.user)

                return {
                    isLastPage: users.length <= postsPerPage,
                    users: users.slice(0, postsPerPage)
                }
            }
            catch (error) {
                if (error instanceof TRPCError)
                    throw error
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later" })
            }
        })
})