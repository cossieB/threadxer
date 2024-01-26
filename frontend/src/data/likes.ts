import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { PostResponse } from "~/api/postFetchers";
import { likeOrUnlikePost } from "~/api/likesFetchers";

export function useLikes() {
    const queryClient = useQueryClient()
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
                    newPost.likes += data
                    return old.map(x => x.post.postId === variables ? newPost : x)
                }
                else if (old && old.post.postId === variables)  {
                    const newPost: PostResponse = JSON.parse(JSON.stringify(old))
                    newPost.liked = data === 1
                    newPost.likes += data
                    return newPost
                }
            })
        },
    }))
    return mutation
}