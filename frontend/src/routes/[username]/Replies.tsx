import { CreateQueryResult, CreateInfiniteQueryResult, InfiniteData } from "@tanstack/solid-query"
import { useReplies } from "~/data/replies"
import { useUserLikes, useUserPosts } from "~/data/user"
import { PostLists } from "../../components/PostLists"
import { type trpcClient } from "~/trpc"

export type PostResponse = Awaited<ReturnType<typeof trpcClient['posts']['getPost']['query']>>

export type P = {
    query: CreateInfiniteQueryResult<InfiniteData<PostResponse[]>, Error>
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