import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { appRouter } from './routers'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { createContext } from './context'

const app = new Hono()

app.use("*", logger(), cors())

app.get('/', (c) => {
    return c.text('Hello Hono!')
})

app.use(
    '/trpc/*',
    trpcServer({
        router: appRouter,
        createContext
    })
)
const port = Number(process.env.PORT) || 8080;

serve({
    fetch: app.fetch,
    port,

})

console.log(`Server is running on port ${port}`)