import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { useNavigate, useParams } from "@solidjs/router";
import { composerState } from "~/globalState/composer";
import { trpcClient } from "~/trpc";

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
            type X = Awaited<ReturnType<typeof trpcClient.posts.getPost.query>>
            const posts = queryClient.getQueryData<X[]>(['posts'])
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

export function useAllPosts(page?: number) {
    return createQuery(() => ({
        queryKey: ['posts'],
        queryFn: () => trpcClient.posts.getAllPosts.query({
            page
        }),

    }))
}