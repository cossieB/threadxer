import { QueryClient, createMutation, createQuery } from "@tanstack/solid-query";
import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import { Params, useNavigate } from "@solidjs/router";

type CreatePost = {
    text: string,
    replyTo?: string,
    quoting?: string
    media?: string[]
}

export type PostResponse = {
    post: {
        text: string;
        userId: string;
        postId: string;
        dateCreated: Date;
        views: number;
        replyTo: string | null;
        didReply: boolean;
        quotedPost: string | null;
        didQuote: boolean;
        likes: number,
        reposts: number
    };
    user: {
        userId: string;
        username: string;
        email: string;
        avatar: string;
        banner: string;
        displayName: string
    }
    liked?: boolean,
    reposted?: boolean
}

async function createPost(post: CreatePost) {
    const res = await customFetch("/api/posts", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
    })
    if (res.ok) {
        const data = await res.json()
        return data.postId as string
    }
    throw await handleApiError(res)
}

async function getAllPosts() {
    const res = await customFetch('/api/posts');
    
    if (res.ok) {
        const data = await res.json() as PostResponse[];
        return data
    }
    throw await handleApiError(res);
}

async function getPost(postId: string) {
    const res = await customFetch(`/api/posts/${postId}`)
    if (res.ok) {
        const data = await res.json();
        return data as PostResponse
    }
    throw await handleApiError(res)
}

export function usePosts() {
    const query = createQuery(() => ({
        queryKey: ['posts'],
        queryFn: getAllPosts,
        
    }))
    return query
}

export function usePost(queryClient: QueryClient, params: Params) {
    const query = createQuery(() => ({
        get enabled() {
            return !!params.postId
        },
        queryKey: ['posts', params.postId],
        queryFn: key => getPost(key.queryKey[1]),
        initialData: () => {
            const posts = queryClient.getQueryData(['posts']) as PostResponse[]
            return posts?.find(p => p.post.postId == params.postId)
        },
    }))
    return query
}

export function usePostMutation(queryClient: QueryClient) {
    const navigate = useNavigate()
    const mutation = createMutation(() => ({
        mutationFn: createPost,
        onSuccess(data, variables, context) {
            queryClient.invalidateQueries({
                queryKey: ['posts']
            })
            navigate(`/posts/${data}`)
        },
    }))
    return mutation
}