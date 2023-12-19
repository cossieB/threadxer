import { QueryClient, createMutation, createQuery } from "@tanstack/solid-query";
import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";

type CreatePost = {
    text: string,
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
    };
    user: {
        userId: string;
        username: string;
        email: string;
        avatar: string;
        banner: string;
        displayName: string
    };
}

async function createPost(post: CreatePost) {
    const res = await customFetch("/api/posts", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
    })
    await handleApiError(res)
}

async function getPosts() {
    const res = await customFetch('/api/posts');
    
    if (res.ok) {
        const data = await res.json() as PostResponse[];
        console.log(data)
        return data
    }
    
    await handleApiError(res);
}

export function usePost() {
    const query = createQuery(() => ({
        queryKey: ['posts'],
        queryFn: getPosts,
        
    }))
    return query
}

export function usePostMutation(queryClient: QueryClient) {
    const mutation = createMutation(() => ({
        mutationFn: createPost,
        onSuccess(data, variables, context) {
            queryClient.invalidateQueries({
                queryKey: ['posts']
            })
        },
        onError(error) {
            console.log("HERE ")
        }
    }))
    return mutation
}