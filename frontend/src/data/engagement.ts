import { useParams } from "@solidjs/router";
import { createQuery, useQueryClient, createMutation } from "@tanstack/solid-query";
import { trpcClient } from "~/trpc";
import { modifyLikesAndRepostsInCache } from "~/utils/modifyLikesAndRepostsInCache";

export function useQuotes(page?: number) {
    const params = useParams();
    return createQuery(() => ({
        queryKey: ['posts', params.postId, 'quotes'],
        queryFn: key => trpcClient.posts.getPostQuotes.query({
            postId: key.queryKey[1],
            page
        })
    }))
}

export function useReplies(page?: number) {
    const params = useParams();
    return createQuery(() => ({
        queryKey: ['posts', params.postId, 'replies'],
        queryFn: key => trpcClient.posts.getPostReplies.query({
            postId: key.queryKey[1],
            page
        })
    }))
}
export function usePostLikes(page?: number) {
    const params = useParams();
    return createQuery(() => ({
        queryKey: ['posts', params.postId, 'likes'],
        queryFn: key => trpcClient.posts.getPostLikes.query({
            postId: key.queryKey[1],
            page
        })
    }))
}

export function useLikes() {
    const queryClient = useQueryClient();
    const mutation = createMutation(() => ({
        mutationFn: trpcClient.likes.likePost.mutate,
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
        mutationFn: trpcClient.reposts.repostPost.mutate,
        onMutate: modifyLikesAndRepostsInCache('reposts', queryClient),
        onError(error, variables, context) {
            queryClient.setQueriesData({
                queryKey: ['posts']
            }, context);
        },
    }));
    return mutation;
}
