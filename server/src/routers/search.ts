import { and, eq, ilike } from "drizzle-orm";
import { getPosts } from "../queries/getPosts";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { Hashtags, Post } from "../db/schema";
import { formatPosts } from "../utils/formatPosts";

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
                .limit(100)
                .offset(input.page * 100)

            const posts = await query
            return posts.map(formatPosts)
        }),
})