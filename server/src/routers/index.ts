import { z } from "zod"
import { router, publicProcedure } from "../trpc"
import { authRouter } from "./auth"
import { postRouter } from "./post"
import { engagementRouter } from "./engagement"
import { refreshRoutes } from "./refresh"
import { userRouter } from "./user"
import { verificationRouter } from "./verify"
import { searchRouter } from "./search"

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