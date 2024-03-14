import { createContext } from './context.js'
import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify"
import Fastify from 'fastify'
import cors from '@fastify/cors';
import serveStatic from "@fastify/static"
import path from 'path';
import fastifyCookie from '@fastify/cookie';
import { startFire } from './config/firebase.js';
import { appRouter, AppRouter } from './routers/index.js';
import * as url from 'url';

// const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const server = Fastify({
    logger: process.env.NODE_ENV == 'development',
    maxParamLength: 5000
})
process.env.NODE_ENV == 'development' &&
    server.register(cors, {
        origin: ["http://localhost:5173", "http://localhost:8080", "http://127.0.0.1:5173"]
    })

server.register(serveStatic, {
    root: path.join(__dirname, "..", "public")
})
server.register(fastifyCookie)
server.setNotFoundHandler((req, reply) => {
    return reply.sendFile("index.html", path.resolve(__dirname, "..", "public"))
})
server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
        router: appRouter,
        createContext,
        onError({ error, path }) {

        }
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions']
})

const PORT = Number(process.env.PORT) || 8080;

(async function () {
    try {
        startFire()
        await server.listen({ port: PORT })
        console.log(`Server is running on port ${PORT}`)
    }
    catch (err) {
        server.log.error(err)
    }
})()

export * from "./routers/index.js"