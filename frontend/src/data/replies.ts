import { useMatch, useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { customFetch } from "~/utils/customFetcher";
import { PostResponse } from "./post";
import { handleApiError } from "./handleApiError";

export function useReplies() {
    const matches = useMatch(() => "users/:username/replies")
    const params = useParams()

    return createQuery(() => ({
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        
        get enabled() {
            return !!matches()
        },
        queryKey: ['posts', 'replies', params.username],
        queryFn: key => getReplies(key.queryKey[2])
    }))
}

//fetchers
async function getReplies(username: string) {
    const res = await customFetch(`/api/users/${username}/replies`.toLowerCase())
    if (res.ok) {
        return await res.json() as PostResponse[]
    }
    throw await handleApiError(res)
} 