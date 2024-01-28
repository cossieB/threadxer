import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import { PostResponse } from "./postFetchers";
import auth from "~/globalState/auth";

export type ApiUserResponse = {
    username: string;
    dateJoined: Date;
    bio: string;
    avatar: string;
    banner: string;
    displayName: string;
    dob?: Date;
    location: string;
    website: string;
};
export async function fetchUser(username: string) {
    const res = await customFetch(`/api/users/${username.toLowerCase()}`);
    if (res.ok) {
        return await res.json() as ApiUserResponse;
    }
    throw await handleApiError(res);
}

export async function mutateUser(e: SubmitEvent) {
    e.preventDefault();

    const fd = new FormData(e.target as HTMLFormElement);
    const res = await customFetch('/api/users', {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(Object.fromEntries(fd))
    });
    if (!res.ok)
        throw await handleApiError(res);
}

export async function fetchUserPosts(username: string) {
    const res = await customFetch(`/api/users/${username}/posts`.toLowerCase());
    if (res.ok) {
        return await res.json() as PostResponse[];
    }
    throw await handleApiError(res);
}

export async function fetchUserLikes(username: string) {
    const res = await customFetch(`/api/users/${username}/likes`.toLowerCase());
    if (res.ok) {
        return await res.json() as PostResponse[];
    }
    throw await handleApiError(res);
}

export async function mutateUserImage(obj: { field: 'avatar' | 'banner'; url: string; }) {
    const { field, url } = obj;
    const res = await customFetch('/api/users', {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({ [field]: url })
    });
    if (res.ok) {
        auth.modifyUser({ [field]: url });
        return;
    }
    throw await handleApiError(res);
}