import { useMatch, useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { trpcClient } from "~/trpc";

export function useReplies(page?: number) {
    const params = useParams()

    return createQuery(() => ({
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        queryKey: ['posts', 'replies', params.username],
        queryFn: key => trpcClient.user.getUserReplies.query({
            username: key.queryKey[2],
            page
        })
    }))
}

