import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";
import { postsPerPage } from "../config/variables.js";
import { Hashtags, Post } from "../db/schema.js";
import { getPosts } from "../queries/getPosts.js";
import { formatPosts } from "../utils/formatPosts.js";

export const searchRouter = router({
    byTerm: publicProcedure
        .input(z.object({
            term: z.string(),
            hashtag: z.string().optional(),
            page: z.number().optional().default(0)
        }))
        .query(async ({ input, ctx }) => {
            const query = getPosts(ctx.user?.userId);
            if (input.hashtag)
                query
                    .innerJoin(Hashtags,
                        and(
                            eq(Hashtags.postId, Post.postId),
                            eq(Hashtags.hashtag, input.hashtag.toLowerCase())
                        )
                    )
            if (input.term)
                query
                    .where(ilike(Post.text, `%${input.term}%`))

            query
                .limit(postsPerPage)
                .offset(input.page * postsPerPage)

            const posts = await query
            return {
                posts: posts.map(formatPosts).slice(0, postsPerPage),
                isLastPage: posts.length < postsPerPage + 1
            }
        }),
})