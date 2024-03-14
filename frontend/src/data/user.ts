import { createQuery, createMutation, useQueryClient, createInfiniteQuery } from "@tanstack/solid-query";
import auth from "~/globalState/auth";
import { useParams } from "@solidjs/router";
import { trpcClient } from "~/trpc";

export function useUser(username: string) {

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

    return query 
}

export function useUserMutation() {
    const queryClient = useQueryClient()
    type ApiUserResponse = Awaited<ReturnType<typeof trpcClient.user.getUser.query>>
    return createMutation(() => ({
        mutationFn: trpcClient.user.updateUser.mutate,
        onSuccess(data, variables, context) {
            queryClient.setQueryData(['users', auth.user.username.toLowerCase()], (old: ApiUserResponse) => ({
                ...old,
                ...variables
            }))
            auth.createUser(data.jwt)
        },
    }))
}

export function useUserPosts() {
    const params = useParams()

    return createInfiniteQuery(() => ({
        queryKey: ['posts', 'byUsername', params.username.toLowerCase()],
        queryFn: key => trpcClient.user.getUserPosts.query({
            username: key.queryKey[2],
            page: key.pageParam
        }),
        initialPageParam: 0,
        getNextPageParam: (last, _b, prev) => last.isLastPage ? null : prev + 1,
    }))
}
export function useUserLikes() {
    const params = useParams()
    return createInfiniteQuery(() => ({
        queryKey: ['posts', 'likes', params.username.toLowerCase()],
        queryFn: key => trpcClient.user.getUserLikes.query({
            username: key.queryKey[2],
            page: key.pageParam
        }),
        initialPageParam: 0,
        getNextPageParam: (last, _b, prev) => last.isLastPage ? null : prev + 1,
    }))
}

export function useUserMedia() {
    const params = useParams()
    return createQuery(() => ({
        queryKey: ['media', params.username.toLowerCase()],
        queryFn: key => trpcClient.user.getUserMedia.query({
            username: key.queryKey[1]
        })
    }))
}