import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { likeOrUnlikePost } from "~/api/likesFetchers";
import { repostOrUnrepost } from "~/api/repostFetchers";
import { getMutateListener } from "~/utils/modifyLikesAndRepostsInCache";

export function useLikes() {
    const queryClient = useQueryClient()
    const mutation = createMutation(() => ({
        mutationFn: likeOrUnlikePost,
        onMutate: getMutateListener('likes', queryClient),
        onError(error, variables, context) {
            queryClient.setQueriesData({
                queryKey: ['posts']
            }, context)
        },
    }))
    return mutation
}
export function useRepost() {
    const queryClient = useQueryClient()
    const mutation = createMutation(() => ({
        mutationFn: repostOrUnrepost,
        onMutate: getMutateListener('reposts', queryClient),
        onError(error, variables, context) {
            queryClient.setQueriesData({
                queryKey: ['posts']
            }, context)
        },
    }))
    return mutation
}

