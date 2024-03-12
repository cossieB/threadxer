import { useParams } from "@solidjs/router";
import { useQueryClient, createMutation, createInfiniteQuery, type InfiniteData } from "@tanstack/solid-query";
import type { ApiPostResponse } from "~/routes/[username]/Replies";
import { trpcClient } from "~/trpc";
import type { Post } from "~/types";
import { modifyLikesAndRepostsInCache, rollbackLikesAndReposts } from "~/utils/modifyLikesAndRepostsInCache";

export function useQuotes(page?: number) {
    const params = useParams();
    return createInfiniteQuery(() => ({
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
    return createInfiniteQuery(() => ({
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
    return createInfiniteQuery(() => ({
        queryKey: ['posts', params.postId, 'likes'],
        queryFn: key => trpcClient.posts.getPostLikes.query({
            postId: key.queryKey[1],
            page
        }),
        initialPageParam: 0,
        getNextPageParam: (last, _b, prev) => last.isLastPage ? null : prev + 1,
    }))
}

export function useLikes(postId: string) {
    const queryClient = useQueryClient();
    const mutation = createMutation(() => ({
        mutationFn: trpcClient.engagement.likePost.mutate,
        onMutate: modifyLikesAndRepostsInCache('likes', queryClient),
        mutationKey: ['likes', postId],
        onError(error, variables, context) {
            queryClient.setQueriesData({
                queryKey: ['posts']
            }, (old: InfiniteData<ApiPostResponse> | Post | undefined) => {
                return rollbackLikesAndReposts(old, variables, context)
            })
        },
    }));
    return mutation;
}
export function useRepost(postId: string) {
    const queryClient = useQueryClient();
    const mutation = createMutation(() => ({
        mutationFn: trpcClient.engagement.repostPost.mutate,
        onMutate: modifyLikesAndRepostsInCache('reposts', queryClient),
        mutationKey: ['reposts', postId],
        onError(error, variables, context) {
            queryClient.setQueriesData({
                queryKey: ['posts']
            }, (old: InfiniteData<ApiPostResponse> | Post | undefined) => {
                return rollbackLikesAndReposts(old, variables, context)
            })
        },
    }));
    return mutation;
}

export function useViewPost(postId: string) {
    return createMutation(() => ({
        mutationKey: ["view", postId],
        mutationFn: () => trpcClient.engagement.viewPost.mutate(postId),
        gcTime: 60
    }))
}

