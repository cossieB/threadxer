import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import { QueryClient, createMutation } from "@tanstack/solid-query";
import { PostResponse } from "./post";

export function useRepost(queryClient: QueryClient) {

    const mutation = createMutation(() => ({
        mutationFn: repostOrUnrepost,
        onSuccess(data, variables, context) {
            
        },
    }))
    return mutation
}

async function repostOrUnrepost(postId: string) {
    const res = await customFetch(`/api/reposts/${postId}`, {
        method: "POST",
    })
    if (res.status === 201) {
        return 1
    }
    if (res.status === 200) {
        return -1
    }
    throw await handleApiError(res)
}
