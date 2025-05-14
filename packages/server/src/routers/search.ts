import { z } from "zod";
import { publicProcedure, router } from "../trpc.js";
import { postsPerPage } from "../config/variables.js";
import { formatPosts } from "../utils/formatPosts.js";
import * as postService from "@/services/postService.js";
import { TRPCError } from "@trpc/server";

export const searchRouter = router({
    byTerm: publicProcedure
        .input(z.object({
            term: z.string(),
            hashtag: z.string().optional(),
            page: z.number().optional().default(0)
        }))
        .query(async ({ input, ctx }) => {
           if (!input.term && !input.hashtag)
                throw new TRPCError({code: "BAD_REQUEST", message: "Nothing to search for"});
            const posts = await postService.searchPosts(ctx.user, input.page, input.term, input.hashtag)
            return {
                posts: posts.map(formatPosts).slice(0, postsPerPage),
                isLastPage: posts.length < postsPerPage + 1
            }
        }),
})