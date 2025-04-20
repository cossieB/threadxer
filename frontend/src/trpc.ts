import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from 'threadxer-server';
import { customFetch } from './utils/customFetcher';
import SuperJSON from 'superjson';

// @ts-expect-error
export const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: '/trpc',
            fetch: customFetch,
            transformer: SuperJSON
        }),
    ],
})
