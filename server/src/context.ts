import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"
import { getUserFromHeader } from "./utils/getUserFromHeader.js";

export async function createContext({req, res}: CreateFastifyContextOptions) {
    const user = getUserFromHeader(req.headers)

    return {user, req, res}
}

export type Context = Awaited<ReturnType<typeof createContext>>