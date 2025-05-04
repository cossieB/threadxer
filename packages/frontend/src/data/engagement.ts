import { useParams } from "@solidjs/router";
import { useQueryClient, useMutation, useInfiniteQuery } from "@tanstack/solid-query";
import { errors } from "#client/globalState/popups.js";
import { trpcClient } from "#client/trpc.js";
import { modifyLikesAndRepostsInCache } from "#client/utils/modifyLikesAndRepostsInCache.js";

export function useQuotes(page?: number) {
    const params = useParams();
    return useInfiniteQuery(() => ({
        queryKey: ['posts', params.postId, 'quotes'],
        queryFn: key => trpcClient.posts.getPostQuotes.query({
            postId: key.queryKey[1],
            page
        }),
        initialPageParam: 0,
        getNextPageParam: (last, _b, prev) => last.isLastPage ? null : prev + 1,
    }))
}

export function usePostReplies(page?: number) {
    const params = useParams();
    return useInfiniteQuery(() => ({
        queryKey: ['posts', params.postId, 'replies'],
        queryFn: key => trpcClient.posts.getPostReplies.query({
            postId: key.queryKey[1],
            page
        }),
        initialPageParam: 0,
        getNextPageParam: (last, _b, prev) => last.isLastPage ? null : prev + 1,
    }))
}
export function usePostLikes(page?: number) {
    const params = useParams();
    return useInfiniteQuery(() => ({
        queryKey: ['posts', params.postId, 'likes'],
        queryFn: key => trpcClient.posts.getPostLikes.query({
            postId: key.queryKey[1],
            page
        }),
        initialPageParam: 0,
        getNextPageParam: (last, _b, prev) => last.isLastPage ? null : prev + 1,
    }))
}

export function useLike(postId: string) {
    const queryClient = useQueryClient();
    const mutation = useMutation(() => ({
        mutationFn: trpcClient.engagement.likePost.mutate,
        mutationKey: ['likes', postId],
        onSuccess: modifyLikesAndRepostsInCache('likes', queryClient),
        onError(error) {
            errors.addError(error.message)
        }
    }));
    return mutation;
}
export function useRepost(postId: string) {
    const queryClient = useQueryClient();
    const mutation = useMutation(() => ({
        mutationFn: trpcClient.engagement.repostPost.mutate,
        mutationKey: ['reposts', postId],
        onSuccess: modifyLikesAndRepostsInCache('reposts', queryClient),
        onError(error) {
            errors.addError(error.message)
        }
    }));
    return mutation;
}

export function useViewPost() {
    return useMutation(() => ({
        mutationKey: ["view"],
        mutationFn: trpcClient.engagement.viewPost.mutate,
        gcTime: 60
    }))
}

