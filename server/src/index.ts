import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { appRouter } from './router'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

app.use("*", logger(), cors())

app.get('/', (c) => {
    return c.text('Hello Hono!')
})

app.use(
    '/trpc/*',
    trpcServer({
        router: appRouter,
    })
)
const port = 8080
serve({
    fetch: app.fetch,
    port: 8080,

})

console.log(`Server is running on port ${port}`)