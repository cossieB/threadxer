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
            // queryClient.invalidateQueries({
            //     queryKey: ['posts']
            // })
            queryClient.setQueryData(['posts'], (old: PostResponse[]) => {
                const post = old.find(x => x.post.postId == variables)
                if (!post) {
                    console.log(variables)
                    return old
                }
                const newPost: PostResponse =  JSON.parse(JSON.stringify(post))
                newPost.liked = data === 1
                newPost.post.likes += data
                return old.map(x => x.post.postId === variables ? newPost : x)
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
