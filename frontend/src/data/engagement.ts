import { useParams } from "@solidjs/router";
import { customFetch } from "~/utils/customFetcher";
import { PostResponse } from "./post";
import { handleApiError } from "./handleApiError";
import { createQuery } from "@tanstack/solid-query";

export function useEngagement(engagement: 'replies'  | 'quotes') {
    const params = useParams();
    return createQuery(() => ({
        queryKey: ['posts', params.postId, engagement],
        queryFn: key => getEngagement(key.queryKey[1], engagement)
    }))
}

// fetcher
async function getEngagement(postId: string, engagement: 'replies' | 'quotes') {
    const res = await customFetch(`/api/posts/${postId}/${engagement}`)
    if (res.ok) {
        return await res.json() as PostResponse[]
    }
    throw await handleApiError(res)
}