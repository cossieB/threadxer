import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import { QueryClient, createMutation } from "@tanstack/solid-query";
import { PostResponse } from "./post";

export function useLikes(queryClient: QueryClient) {

    const mutation = createMutation(() => ({
        mutationFn: likeOrUnlikePost,
        onSuccess(data, variables, context) {
            
        },
    }))
    return mutation
}

async function likeOrUnlikePost(postId: string) {
    const res = await customFetch(`/api/likes/${postId}`, {
        method: "POST",
    })
    if (res.status === 201) {
        return 1
    }
    if (res.status === 200) {
        return -1
    }
    await handleApiError(res)
}
