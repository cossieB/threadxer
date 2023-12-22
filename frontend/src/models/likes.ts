import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import { QueryClient, createMutation } from "@tanstack/solid-query";
import { PostResponse } from "./post";
import { produce, reconcile } from "solid-js/store";
import { user } from "~/globalState/user";

export function useLikes(queryClient: QueryClient) {

    const mutation = createMutation(() => ({
        mutationFn: likeOrUnlikePost,
        onSuccess(data, variables, context) {
            queryClient.invalidateQueries({
                queryKey: ['posts']
            })
        },
    }))
    return mutation
}

async function likeOrUnlikePost(postId: string) {
    if (!user.username) 
        throw new Error("Please login to like")
    const res = await customFetch(`/api/likes/${postId}`, {
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
