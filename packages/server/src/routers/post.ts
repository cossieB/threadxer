import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { postsPerPage } from "../config/variables.js";
import { protectedProcedure, publicProcedure, router } from "../trpc.js";
import { formatPosts } from "../utils/formatPosts.js";
import { CreatePostSchema } from "#server/models/Post.js";
import * as postService from "#server/services/postService.js";
import AppError from "#server/utils/AppError.js";
import { TokenUser } from "#server/types.js";

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
                const post = await postService.getPost(input, ctx.user);
                if (!post)
                    throw new TRPCError({ code: 'NOT_FOUND', message: "That post doesn't exist" })
                const p = formatPosts(post)
                return p
            }
            catch (error) {
                if (error instanceof TRPCError)
                    throw error
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
            postId: z.string(),
            page: z.number().default(0)
        }))
        .query(async ({ ctx, input }) => {
            try {
                return await getAndFormatPosts(postService.getPostReplies, input.postId, input.page, ctx.user)
            }
            catch (error) {
                if (error instanceof TRPCError)
                    throw error
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later" })
            }
        }),

    getPostQuotes: publicProcedure
        .input(z.object({
            postId: z.string(),
            page: z.number().default(0)
        }))
        .query(async ({ ctx, input }) => {
            try {
                return await getAndFormatPosts(postService.getPostQuotes, input.postId, input.page, ctx.user)
            }
            catch (error) {
                if (error instanceof TRPCError)
                    throw error
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Something went wrong. Please try again later" })
            }
        }),

    getPostLikes: publicProcedure
        .input(z.object({
            postId: z.string(),
            page: z.number().default(0)
        }))
        .query(async ({ ctx, input }) => {
            try {
                const users = await postService.getPostLikes(input.postId, input.page, ctx.user)
                if (users instanceof AppError)
                    throw users.toTRPCError()

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

type Service = (postId: string, page: number, user: TokenUser | null) => Promise<Parameters<typeof formatPosts>[0][] | AppError>

async function getAndFormatPosts(fn: Service, postId: string, page: number, user: TokenUser | null) {
    const posts = await fn(postId, page, user)
    if (posts instanceof AppError)
        throw posts.toTRPCError()
    return {
        posts: posts.map(formatPosts).slice(0, postsPerPage),
        isLastPage: posts.length < postsPerPage + 1
    }
}