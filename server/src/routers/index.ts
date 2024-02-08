import { z } from "zod"
import { router, publicProcedure, protectedProcedure } from "../trpc"
import { authRouter } from "./auth"

export const appRouter = router({
    hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
        return `Hello ${input ?? 'World'}!`
    }),
    auth: authRouter
})

export type AppRouter = typeof appRouter