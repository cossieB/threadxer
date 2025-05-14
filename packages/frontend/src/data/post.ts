import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { useNavigate, useParams } from "@solidjs/router";
import { composerState } from "~/globalState/composer.js";
import { trpcClient } from "~/trpc.js";
import type { ApiPostResponse } from "~/routes/[username]/Replies.js";

export function usePost() {
    const params = useParams()
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const postQuery = useQuery(() => ({
        get enabled() {
            return !!params.postId
        },
        queryKey: ['posts', 'byId', params.postId],
        queryFn: key => trpcClient.posts.getPost.query(key.queryKey[2]),
        initialData: () => {
            const cache = queryClient.getQueryData<InfiniteData<ApiPostResponse[]>>(['posts']);
            const posts = cache?.pages.flat().map(x => x.posts).flat(); 
            return posts?.find(p => p.post.postId == params.postId)
        },
        retry(failureCount, error) {
            return failureCount < 3 && !error.message.includes("post doesn't exist")
        },
    }))
    const mutation = useMutation(() => ({
        mutationFn: trpcClient.posts.createPost.mutate,
        onSuccess(data, variables, context) {
            queryClient.invalidateQueries({
                queryKey: ['posts']
            })
            navigate(`/posts/${data}`)
            composerState.close()
        },
    }))
    return { mutation, postQuery }
}

export function useAllPosts() {
    return useInfiniteQuery(() => ({
        queryKey: ['posts'],
        queryFn: (key) => trpcClient.posts.getAllPosts.query({
            page: key.pageParam
        }),
        initialPageParam: 0,
        getNextPageParam: (last, _b, prev) => last.isLastPage ? null : prev + 1,
    }))
}