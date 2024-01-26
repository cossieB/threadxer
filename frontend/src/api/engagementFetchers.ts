import { PostResponse } from "./postFetchers";
import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import auth from "~/globalState/auth";
import { errors } from "~/globalState/popups";

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

export async function repostOrUnrepost(postId: string) {
    if (!auth.user.username) {
        errors.addError("Please login to repost");
        throw new Error("Please login to repost");
    }
    const res = await customFetch(`/api/reposts/${postId}`, {
        method: "POST",
    });
    if (res.status === 201) {
        return 1;
    }
    if (res.status === 200) {
        return -1;
    }
    const err = await handleApiError(res);
    errors.addError(err.message);
    throw err;
}

export async function likeOrUnlikePost(postId: string) {
    if (!auth.user.username) {
        errors.addError("Please login to like");
        throw new Error("Please login to like");
    }
    const res = await customFetch(`/api/likes/${postId}`, {
        method: "POST",
    });
    if (res.status === 201) {
        return 1;
    }
    if (res.status === 200) {
        return -1;
    }
    const err = await handleApiError(res);
    errors.addError(err.message);
    throw err;
}

