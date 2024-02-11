import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { AppRouter } from 'threadxer-server'
import { customFetch } from './utils/customFetcher';

export const trpcClient = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: 'http://localhost:8080/trpc',
            fetch: customFetch
        }),
    ],
})
