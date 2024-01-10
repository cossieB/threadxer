import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import { createQuery, createMutation, useQueryClient } from "@tanstack/solid-query";
import auth from "~/globalState/auth";

export function useUser(username: string) {
    const queryClient = useQueryClient()
    const query = createQuery(() => ({
        get enabled() {
            return !!username
        },
        queryKey: ['users', username.toLowerCase()],
        queryFn: (key) => fetchUser(key.queryKey[1]),
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry(failureCount, error) {
            return !error.message.includes("No user with that username exists") && failureCount < 3
        },
    }))

    const mutation = createMutation(() => ({
        mutationFn: mutateUser,
        onSuccess() {
            queryClient.invalidateQueries({
                queryKey: ['users', auth.user.username.toLowerCase()]
            })
        },
        onError(error) {
            console.log(error)
        },
    }))
    const imageMutation = createMutation(() => ({
        mutationFn: mutateUserImage,
        onSuccess(data, variables, context) {
            queryClient.setQueryData(['users', auth.user.username.toLowerCase()], (old: ApiUserResponse) => ({
                ...old,
                [variables.field]: variables.url
            }))
            auth.modifyUser({[variables.field]: variables.url})
        },
    }))
    return { mutation, imageMutation, query }
}
export function useUserPosts(username: string) {
    return createQuery(() => ({
        queryKey: ['posts', 'byUsername', username.toLowerCase()],
        queryFn: key => fetchUserPosts(key.queryKey[2])
    }))
}

// fetchers
async function mutateUserImage(obj: { field: 'avatar' | 'banner', url: string }) {
    const { field, url } = obj
    const res = await customFetch('/api/users', {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({ [field]: url })
    })
    if (res.ok) {
        auth.modifyUser({[field]: url})
        return
    }
    throw await handleApiError(res);
}
type ApiUserResponse = {
    username: string;
    dateJoined: Date;
    bio: string;
    avatar: string;
    banner: string;
    displayName: string;
    dob?: Date;
    location: string;
    website: string
};
async function fetchUser(username: string) {
    const res = await fetch(`/api/users/${username.toLowerCase()}`);
    if (res.ok) {
        return await res.json() as ApiUserResponse;
    }
    throw await handleApiError(res);
}

async function mutateUser(e: SubmitEvent) {
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

async function fetchUserPosts(username: string) {
    const res = await customFetch(`/api/users/${username}/posts`.toLowerCase());
    if (res.ok) {
        return res.json() 
    }
    return await handleApiError(res)
}