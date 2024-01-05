import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import { QueryClient, createMutation } from "@tanstack/solid-query";
import { PostResponse } from "./post";
import auth from "~/globalState/auth";

export function useLikes(queryClient: QueryClient) {

    const mutation = createMutation(() => ({
        mutationFn: likeOrUnlikePost,
        onSuccess(data, variables, context) {
            queryClient.setQueriesData({
                queryKey: ['posts']
            }, (old: PostResponse[] | PostResponse | undefined) => {
                if (Array.isArray(old)) {
                    const post = old.find(x => x.post.postId == variables)
                    if (!post) {
                        console.log(variables)
                        return old
                    }
                    const newPost: PostResponse = JSON.parse(JSON.stringify(post))
                    newPost.liked = data === 1
                    newPost.post.likes += data
                    return old.map(x => x.post.postId === variables ? newPost : x)
                }
                else if (old && old.post.postId === variables)  {
                    const newPost: PostResponse = JSON.parse(JSON.stringify(old))
                    newPost.liked = data === 1
                    newPost.post.likes += data
                    return newPost
                }
            })
        },
    }))
    return mutation
}

async function likeOrUnlikePost(postId: string) {
    if (!auth.user.username)
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
