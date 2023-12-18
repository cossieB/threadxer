import { QueryClient, createMutation } from "@tanstack/solid-query";
import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";

type Post = {
    text: string,
    media?: string[]
}

async function createPost(post: Post) {
    const res = await customFetch("/api/posts", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
    })
    await handleApiError(res)
}

export function usePostMutation(queryClient: QueryClient) {
    const mutation = createMutation(() => ({
        mutationFn: createPost,
        onSuccess(data, variables, context) {
            queryClient.invalidateQueries({
                queryKey: ['posts']
            })
        },
        onError(error) {
            console.log("HERE ")
        }
    }))
    return mutation
}