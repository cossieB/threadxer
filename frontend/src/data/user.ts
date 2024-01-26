import { createQuery, createMutation, useQueryClient } from "@tanstack/solid-query";
import auth from "~/globalState/auth";
import { useParams } from "@solidjs/router";
import { fetchUser, mutateUser, ApiUserResponse, fetchUserPosts, fetchUserLikes } from "../api/userFetchers";
import { mutateUserImage } from "../api/userFetchers";

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
export function useUserPosts() {
    const params = useParams()

    return createQuery(() => ({
        queryKey: ['posts', 'byUsername', params.username.toLowerCase()],
        queryFn: key => fetchUserPosts(key.queryKey[2])
    }))
}
export function useUserLikes() {
    const params = useParams()
    return createQuery(() => ({
        queryKey: ['posts', 'likes', params.username.toLowerCase()],
        queryFn: key => fetchUserLikes(key.queryKey[2])
    }))
}

