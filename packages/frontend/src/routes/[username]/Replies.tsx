import type { UseInfiniteQueryResult, InfiniteData } from "@tanstack/solid-query"
import { useReplies } from "#client/data/replies.js"
import { useUserLikes, useUserPosts } from "#client/data/user.js"
import { PostLists } from "#client/components/PostLists.js"
import { ApiPostResponse } from "#client/types.js";

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