import { initTRPC, TRPCError } from '@trpc/server'
import { Context } from './context'

const t = initTRPC.context<Context>().create()

export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(async(opts) => {
    if (!opts.ctx.user)
        throw new TRPCError({code: 'UNAUTHORIZED'})
    return opts.next({
        ctx: {
            user: opts.ctx.user
        }
    })
})

export const router = t.router