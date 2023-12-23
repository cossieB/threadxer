import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import { QueryClient, createMutation } from "@tanstack/solid-query";
import { PostResponse } from "./post";
import { user } from "~/globalState/user";

export function useRepost(queryClient: QueryClient) {

    const mutation = createMutation(() => ({
        mutationFn: repostOrUnrepost,
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
                    newPost.reposted = data === 1
                    newPost.post.reposts += data
                    return old.map(x => x.post.postId === variables ? newPost : x)
                }
                else if (old && old.post.postId === variables)  {
                    const newPost: PostResponse = JSON.parse(JSON.stringify(old))
                    newPost.reposted = data === 1
                    newPost.post.reposts += data
                    return newPost
                }
            })
        },
    }))
    return mutation
}

async function repostOrUnrepost(postId: string) {
    if (!user.username)
        throw new Error("Please log in to repost")
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
