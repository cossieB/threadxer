import { InfiniteData, createInfiniteQuery, createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { useNavigate, useParams } from "@solidjs/router";
import { composerState } from "~/globalState/composer";
import { trpcClient } from "~/trpc";
import { ApiPostResponse } from "~/routes/[username]/Replies";

export function usePost() {
    const params = useParams()
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const postQuery = createQuery(() => ({
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
    const mutation = createMutation(() => ({
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
    return createInfiniteQuery(() => ({
        queryKey: ['posts'],
        queryFn: (key) => trpcClient.posts.getAllPosts.query({
            page: key.pageParam
        }),
        initialPageParam: 0,
        getNextPageParam: (last, _b, prev) => last.isLastPage ? null : prev + 1,
    }))
}