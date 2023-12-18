import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";
import { createQuery, createMutation, QueryClient } from "@tanstack/solid-query";
import { setUser, user } from "~/globalState/user";

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

export function useUser(username: string) {
    const query = createQuery(() => ({
        get enabled() {
            return !!username
        },
        queryKey: ['users', username.toLowerCase()],
        queryFn: (key) => fetchUser(key.queryKey[1]),
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    }))

    return query
}

export function useUserMutation(queryClient: QueryClient) {
    const mutation = createMutation(() => ({
        mutationFn: mutateUser,
        onSuccess() {
            queryClient.invalidateQueries({
                queryKey: ['users', user.username.toLowerCase()]
            })
        },
        onError(error) {
            console.log(error)
        },
    }))
    const imageMutation = createMutation(() => ({
        mutationFn: mutateUserImage,
        onSuccess(data, variables, context) {
            queryClient.setQueryData(['users', user.username.toLowerCase()], (old: ApiUserResponse) => ({
                ...old,
                [variables.field]: variables.url   
            }))
            setUser(variables.field, variables.url)
            const u = JSON.parse(localStorage.getItem('user') ?? '{}')
            localStorage.setItem('user', JSON.stringify({...u, [variables.field]: variables.url}))
        },
    }))
    return {mutation, imageMutation}
}

async function mutateUserImage(obj: {field: 'avatar' | 'banner', url: string}) {
    const {field, url} = obj
    const res = await customFetch('/api/users', {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({[field]: url})
    })
    if (res.ok) {

        return
    }   
    await handleApiError(res);
}

async function fetchUser(username: string) {
    const res = await fetch(`/api/users/${username.toLowerCase()}`);
    if (res.ok) {
        return await res.json() as ApiUserResponse;
    }
    await handleApiError(res);
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
    await handleApiError(res);
}