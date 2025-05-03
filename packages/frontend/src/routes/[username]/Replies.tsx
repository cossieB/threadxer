import type { UseInfiniteQueryResult, InfiniteData } from "@tanstack/solid-query"
import type { inferRouterOutputs } from '@trpc/server';
import { useReplies } from "~/data/replies"
import { useUserLikes, useUserPosts } from "~/data/user"
import { PostLists } from "../../components/PostLists"
import { type AppRouter } from "threadxer-server";

type RouterOutputs = inferRouterOutputs<AppRouter>
type PostResponse = RouterOutputs["posts"]["getPost"]

export type ApiPostResponse = {
    posts: PostResponse[]
    isLastPage: boolean
}

export type P = {
    query: UseInfiniteQueryResult<InfiniteData<ApiPostResponse>, Error>
}

export function Replies() {
    const query = useReplies()
    return <PostLists query={query} />
}

export function UserPosts() {
    const query = useUserPosts()
    return <PostLists query={query} />
}

export function Likes() {
    const query = useUserLikes()
    return <PostLists query={query} />
}