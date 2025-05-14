import type { UseInfiniteQueryResult, InfiniteData } from "@tanstack/solid-query"
import { useReplies } from "~/data/replies.js"
import { useUserLikes, useUserPosts } from "~/data/user.js"
import { PostLists } from "~/components/PostLists.js"
import { ApiPostResponse } from "~/types.js";

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