import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import { validateAndUpload } from "~/utils/uploadToFirebase";
import { trpcClient } from "~/trpc";

export async function createPost({ media, ...post }: CreatePost) {
    const urls = await Promise.all(validateAndUpload(media ?? [], 'media', 8))
    const data = urls.map(x => ({
        url: x.url,
        isVideo: x.file.type.includes('video'),
        ref: x.ref
    }))
    const res = await customFetch("/api/posts", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...post,
            ...(data.length > 0 && {
                media: data
            })
        })
    });
    if (res.ok) {
        const data = await res.json();
        return data.postId as string;
    }
    throw await handleApiError(res);
}
export async function getAllPosts() {
    return await trpcClient.posts.getAllPosts.query({});
}
export async function getPost(postId: string) {
    const res = await customFetch(`/api/posts/${postId}`);
    if (res.ok) {
        const data = await res.json();
        return data as PostResponse;
    }
    throw await handleApiError(res);
}
type CreatePost = {
    text: string;
    replyTo?: string;
    quotedPost?: string;
    media?: File[];
};

export type PostResponse = {
    liked?: boolean | undefined;
    reposted?: boolean | undefined;
    likes: number;
    reposts: number;
    quotes: number;
    replies: number;
    isRepost?: boolean;
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
    };
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
    };
    originalPostAuthor?: {
        username: string;
        avatar: string;
        banner: string;
        displayName: string;
    };
    quoteAuthor?: {
        username: string;
        avatar: string;
        banner: string;
        displayName: string;
    };
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
    };
    media: {
        url: string,
        is_video: boolean
    }[] | null
};
