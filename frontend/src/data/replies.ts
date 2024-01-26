import { useMatch, useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { getReplies } from "../api/replyFetchers";

export function useReplies() {
    const matches = useMatch(() => "users/:username/replies")
    const params = useParams()

    return createQuery(() => ({
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        
        // get enabled() {
        //     return !!matches()
        // },
        queryKey: ['posts', 'replies', params.username],
        queryFn: key => getReplies(key.queryKey[2])
    }))
}

