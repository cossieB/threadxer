import { z } from "zod"
import { router, publicProcedure, protectedProcedure } from "../trpc"

export const appRouter = router({
    hello: protectedProcedure.input(z.string().nullish()).query(({ input }) => {
        return `Hello ${input ?? 'World'}!`
    }),
})

export type AppRouter = typeof appRouter