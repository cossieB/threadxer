import { createQuery, createMutation, useQueryClient } from "@tanstack/solid-query";
import auth from "~/globalState/auth";
import { useParams } from "@solidjs/router";
import { fetchUser, mutateUser, ApiUserResponse, fetchUserPosts, fetchUserLikes, fetchUserMedia } from "../api/userFetchers";
import { mutateUserImage } from "../api/userFetchers";
import { trpcClient } from "~/trpc";

export function useUser(username: string) {
    const queryClient = useQueryClient()
    const query = createQuery(() => ({
        get enabled() {
            return !!username
        },
        queryKey: ['users', username.toLowerCase()],
        queryFn: (key) => trpcClient.user.getUser.query(key.queryKey[1]),
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry(failureCount, error) {
            return !error.message.includes("No user with that username exists") && failureCount < 3
        },
        placeholderData: (username.toLowerCase() == auth.user.username.toLowerCase()) ? {
            username: auth.user.username,
            dateJoined: new Date(0),
            bio: "",
            avatar: auth.user.avatar,
            banner: auth.user.banner,
            displayName: "",
            location: "",
            website: "",
            dateOfBirth: null
        } : undefined
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
        mutationFn: trpcClient.user.updateUser.mutate,
        onSuccess(data, variables, context) {
            queryClient.setQueryData(['users', auth.user.username.toLowerCase()], (old: ApiUserResponse) => ({
                ...old,
                ...variables
            }))
            auth.createUser(data.jwt)
        },
    }))
    return { mutation, imageMutation, query }
}
export function useUserPosts(page?: number) {
    const params = useParams()

    return createQuery(() => ({
        queryKey: ['posts', 'byUsername', params.username.toLowerCase()],
        queryFn: key => trpcClient.user.getUserPosts.query({
            username: key.queryKey[2],
            page
        })
    }))
}
export function useUserLikes(page?: number) {
    const params = useParams()
    return createQuery(() => ({
        queryKey: ['posts', 'likes', params.username.toLowerCase()],
        queryFn: key => trpcClient.user.getUserLikes.query({
            username: key.queryKey[2],
            page
        })
    }))
}

export function useUserMedia() {
    const params = useParams()
    return createQuery(() => ({
        queryKey: ['media', params.username.toLowerCase()],
        queryFn: key => fetchUserMedia(key.queryKey[1])
    }))
}