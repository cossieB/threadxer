import { z } from "zod"
import { router, publicProcedure } from "../trpc"
import { authRouter } from "./auth"
import { postRouter } from "./post"
import { likeRouter } from "./likes"
import { repostRouter } from "./repost"

export const appRouter = router({
    hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
        return `Hello ${input ?? 'World'}!`
    }),
    auth: authRouter,
    posts: postRouter,
    likes: likeRouter,
    reposts: repostRouter,
})

export type AppRouter = typeof appRouter