import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from 'threadxer-server';
import { customFetch } from './utils/customFetcher';
import SuperJSON from 'superjson';

export const trpcClient = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: '/trpc',
            fetch: customFetch,
        }),
    ],
    transformer: SuperJSON
})
