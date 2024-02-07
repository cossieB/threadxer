import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { AppRouter } from 'threadxer-server/src/router'

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:8080/trpc',
    }),
  ],
})

console.log(await client.hello.query('Hono'))