import { type trpcServer } from '@hono/trpc-server'
import { getUserFromHeader } from "./utils/getUserFromHeader";

type A = Parameters<typeof trpcServer>[0]['createContext']
type B = Parameters<NonNullable<A>>[0]

export async function createContext(opts: B) {
    const user = await getUserFromHeader(opts.req.headers)

    return {user}
}

export type Context = Awaited<ReturnType<typeof createContext>>