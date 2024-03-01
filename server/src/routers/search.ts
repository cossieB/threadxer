import { eq, ilike } from "drizzle-orm";
import { getPosts } from "../queries/getPosts";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { z } from "zod";
import { Hashtags, Post } from "../db/schema";
import { formatPosts } from "../utils/formatPosts";

export const searchRouter = router({
    byTerm: protectedProcedure
        .input(z.object({
            term: z.string(),
            page: z.number().optional().default(0)
        }))
        .query(async ({input, ctx}) => {
            const query = getPosts(ctx.user.userId)
            query
                .where(ilike(Post.text, input.term))
                .limit(100)
                .offset(input.page * 100)

            const posts = await query
            return posts.map(formatPosts)
        }),

    byHashtag: publicProcedure
        .input(z.object({
            hashtag: z.string(),
            page: z.number().optional().default(0)            
        }))
        .query(async ({input, ctx}) => {
            const query = getPosts(ctx.user?.userId)
            query
                .innerJoin(Hashtags, eq(Hashtags.postId, Post.postId))
                .where(eq(Hashtags.hashtag, input.hashtag.toLowerCase()))
                .limit(100)
                .offset(input.page * 100)

                const posts = await query
                return posts.map(formatPosts)
        })
})