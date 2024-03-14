import { z } from "zod"
import { publicProcedure, router } from "../trpc.js"
import { authRouter } from "./auth.js"
import { engagementRouter } from "./engagement.js"
import { postRouter } from "./post.js"
import { refreshRoutes } from "./refresh.js"
import { searchRouter } from "./search.js"
import { userRouter } from "./user.js"
import { verificationRouter } from "./verify.js"

export const appRouter = router({
    hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
        return `Hello ${input ?? 'World'}!`
    }),
    auth: authRouter,
    posts: postRouter,
    engagement: engagementRouter,
    refresh: refreshRoutes,
    search: searchRouter,
    user: userRouter,
    verify: verificationRouter
})

export type AppRouter = typeof appRouter