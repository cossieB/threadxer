import { useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { getEngagement } from "~/api/engagementFetchers";

export function useEngagement(engagement: 'replies'  | 'quotes') {
    const params = useParams();
    return createQuery(() => ({
        queryKey: ['posts', params.postId, engagement],
        queryFn: key => getEngagement(key.queryKey[1], engagement)
    }))
}