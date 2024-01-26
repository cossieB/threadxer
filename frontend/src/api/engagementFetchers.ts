import { PostResponse } from "./postFetchers";
import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";

export async function getEngagement(postId: string, engagement: 'replies' | 'quotes') {
    const res = await customFetch(`/api/posts/${postId}/${engagement}`);
    if (res.ok) {
        return await res.json() as PostResponse[];
    }
    throw await handleApiError(res);
}

type UserResponse = {
    userId: string;
    username: string;
    avatar: string;
    banner: string;
    displayName: string;
    bio: string
};

export async function getPostLikes(postId: string) {
    const res = await fetch(`/api/posts/${postId}/likes`)
    if (res.ok) {
        return await res.json() as UserResponse[]
    }
    throw await handleApiError(res)
}