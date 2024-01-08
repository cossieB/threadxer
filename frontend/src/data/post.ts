import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import { useMatch, useNavigate, useParams } from "@solidjs/router";
import { composerState } from "~/globalState/composer";

export function usePost() {
    const params = useParams()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const matches = useMatch(() => "/")
    
    const postQuery = createQuery(() => ({
        get enabled() {
            return !!params.postId
        },
        queryKey: ['posts', params.postId],
        queryFn: key => getPost(key.queryKey[1]),
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

// fetchers
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

type CreatePost = {
    text: string,
    replyTo?: string,
    quotedPost?: string
    media?: string[]
}

export type PostResponse = {
    liked?: boolean | undefined;
    reposted?: boolean | undefined;
    likes: number,
    reposts: number,
    isRepost?: boolean
    post: {
        userId: string;
        postId: string;
        text: string;
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
        avatar: string;
        banner: string;
        displayName: string;
    }
    originalPost?: {
        userId: string;
        postId: string;
        text: string;
        dateCreated: Date;
        views: number;
        replyTo: string | null;
        didReply: boolean;
        quotedPost: string | null;
        didQuote: boolean;
    }
    originalPostAuthor?: {
        username: string;
        avatar: string;
        banner: string;
        displayName: string;
    }
    quoteAuthor?: {
        username: string;
        avatar: string;
        banner: string;
        displayName: string;
    }
    quotePost?: {
        userId: string;
        postId: string;
        text: string;
        dateCreated: Date;
        views: number;
        replyTo: string | null;
        didReply: boolean;
        quotedPost: string | null;
        didQuote: boolean;
    }
}