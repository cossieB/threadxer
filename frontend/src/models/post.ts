import { QueryClient, createMutation, createQuery } from "@tanstack/solid-query";
import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import { useNavigate } from "@solidjs/router";

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

async function getPosts() {
    const res = await customFetch('/api/posts');
    
    if (res.ok) {
        const data = await res.json() as PostResponse[];
        return data
    }
    throw await handleApiError(res);
}

async function fetchPost(postId: string) {
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
        queryFn: getPosts,
        
    }))
    return query
}

export function usePost(postId: string) {
    const query = createQuery(() => ({
        queryKey: ['postById', postId],
        queryFn: key => fetchPost(key.queryKey[1])
    }))
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
        onError(error) {
            console.log("HERE ")
        }
    }))
    return mutation
}