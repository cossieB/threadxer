import { useParams } from "@solidjs/router";
import { createQuery, useQueryClient, createMutation, createInfiniteQuery } from "@tanstack/solid-query";
import { PostResponse } from "~/routes/[username]/Replies";
import { trpcClient } from "~/trpc";
import { modifyLikesAndRepostsInCache } from "~/utils/modifyLikesAndRepostsInCache";

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

export function useLikes() {
    const queryClient = useQueryClient();
    const mutation = createMutation(() => ({
        mutationFn: trpcClient.engagement.likePost.mutate,
        onMutate: modifyLikesAndRepostsInCache('likes', queryClient),
        onError(error, variables, context) {
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
                    newPost.liked = context?.fieldIsActive
                    newPost.likes = context?.count ?? 0
                    return old.map(x => x.post.postId === variables ? newPost : x)
                }
                else if (old && old.post.postId === variables) {
                    const newPost: PostResponse = JSON.parse(JSON.stringify(old))
                    newPost.liked = context?.fieldIsActive
                    newPost.likes = context?.count ?? 0
                    return newPost
                }
            })
        },
    }));
    return mutation;
}
export function useRepost() {
    const queryClient = useQueryClient();
    const mutation = createMutation(() => ({
        mutationFn: trpcClient.engagement.repostPost.mutate,
        onMutate: modifyLikesAndRepostsInCache('reposts', queryClient),
        onError(error, variables, context) {
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
                    newPost.reposted = context?.fieldIsActive
                    newPost.reposts = context?.count ?? 0
                    return old.map(x => x.post.postId === variables ? newPost : x)
                }
                else if (old && old.post.postId === variables) {
                    const newPost: PostResponse = JSON.parse(JSON.stringify(old))
                    newPost.reposted = context?.fieldIsActive
                    newPost.reposts = context?.count ?? 0
                    return newPost
                }
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