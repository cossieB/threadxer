import { useParams } from "@solidjs/router";
import { createInfiniteQuery } from "@tanstack/solid-query";
import { trpcClient } from "~/trpc";

export function useReplies() {
    const params = useParams()

    return createInfiniteQuery(() => ({
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryKey: ['posts', 'replies', params.username],
        queryFn: key => trpcClient.user.getUserReplies.query({
            username: key.queryKey[2],
            page: key.pageParam
        }),
        initialPageParam: 0,
        getNextPageParam: (_a, _b, prev) => prev + 1
    }))
}

