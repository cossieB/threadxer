import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { useMatch, useNavigate, useParams } from "@solidjs/router";
import { composerState } from "~/globalState/composer";
import { getPost, PostResponse, createPost, getAllPosts } from "~/api/postFetchers";

export function usePost() {
    const params = useParams()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const matches = useMatch(() => "/")
    
    const postQuery = createQuery(() => ({
        get enabled() {
            return !!params.postId
        },
        queryKey: ['posts', 'byId', params.postId],
        queryFn: key => getPost(key.queryKey[2]),
        initialData: () => {
            const posts = queryClient.getQueryData<PostResponse[]>(['posts'])
            return posts?.find(p => p.post.postId == params.postId)
        },
        retry(failureCount, error) {
            return failureCount < 3 && !error.message.includes("post doesn't exist")
        },
    }))
    const mutation = createMutation(() => ({
        mutationFn: createPost,
        onSuccess(data, variables, context) {
            queryClient.invalidateQueries({
                queryKey: ['posts']
            })
            navigate(`/posts/${data}`)
            composerState.close()
        },
    }))
    const allPostsQuery = createQuery(() => ({
        get enabled() {
            return !!matches()
        },
        queryKey: ['posts'],
        queryFn: getAllPosts,
        
    }))
    return {mutation, postQuery, allPostsQuery}
}