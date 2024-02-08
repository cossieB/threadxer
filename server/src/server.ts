import { AppRouter, appRouter } from './routers'
import { createContext } from './context'
import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify"
import Fastify from 'fastify'
import cors from '@fastify/cors';
import serveStatic from "@fastify/static"
import path from 'path';
import fastifyCookie from '@fastify/cookie';

const server = Fastify({
    logger: true,
    maxParamLength: 5000
})
server.register(cors)
server.register(serveStatic, {
    root: path.join(__dirname, "..", "public")
})
server.register(fastifyCookie)
server.get("/", (req, reply) => {
    return reply.sendFile("index.html", path.resolve(__dirname, "..", "public"))
})
server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
        router: appRouter,
        createContext,
        
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions']
})

const PORT = Number(process.env.PORT) || 8080;

(async function() {
    try {
        await server.listen({port: PORT})
        console.log(`Server is running on port ${PORT}`)
    } 
    catch (err) {
        server.log.error(err)
    }
})()