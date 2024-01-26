import { QueryClient, createMutation, useQueryClient } from "@tanstack/solid-query";
import { PostResponse } from "~/api/postFetchers";
import { repostOrUnrepost } from "~/api/repostFetchers";

export function useRepost() {
    const queryClient = useQueryClient()
    
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
                    newPost.reposts += data
                    return old.map(x => x.post.postId === variables ? newPost : x)
                }
                else if (old && old.post.postId === variables)  {
                    const newPost: PostResponse = JSON.parse(JSON.stringify(old))
                    newPost.reposted = data === 1
                    newPost.reposts += data
                    return newPost
                }
            })
        },
    }))
    return mutation
}