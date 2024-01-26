import { useParams } from "@solidjs/router";
import { createQuery, useQueryClient, createMutation } from "@tanstack/solid-query";
import { getEngagement, getPostLikes } from "~/api/engagementFetchers";
import { likeOrUnlikePost } from "~/api/engagementFetchers";
import { repostOrUnrepost } from "~/api/engagementFetchers";
import { modifyLikesAndRepostsInCache } from "~/utils/modifyLikesAndRepostsInCache";


export function useEngagement(engagement: 'replies'  | 'quotes') {
    const params = useParams();
    return createQuery(() => ({
        queryKey: ['posts', params.postId, engagement],
        queryFn: key => getEngagement(key.queryKey[1], engagement)
    }))
}

export function usePostLikes() {
    const params = useParams();
    return createQuery(() => ({
        queryKey: ['posts', params.postId, 'likes'],
        queryFn: key => getPostLikes(key.queryKey[1])
    }))
}
export function useLikes() {
    const queryClient = useQueryClient();
    const mutation = createMutation(() => ({
        mutationFn: likeOrUnlikePost,
        onMutate: modifyLikesAndRepostsInCache('likes', queryClient),
        onError(error, variables, context) {
            queryClient.setQueriesData({
                queryKey: ['posts']
            }, context);
        },
    }));
    return mutation;
}
export function useRepost() {
    const queryClient = useQueryClient();
    const mutation = createMutation(() => ({
        mutationFn: repostOrUnrepost,
        onMutate: modifyLikesAndRepostsInCache('reposts', queryClient),
        onError(error, variables, context) {
            queryClient.setQueriesData({
                queryKey: ['posts']
            }, context);
        },
    }));
    return mutation;
}
