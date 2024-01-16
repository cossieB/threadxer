import { CreateQueryResult } from "@tanstack/solid-query"
import { PostResponse } from "~/data/post"
import { useReplies } from "~/data/replies"
import { useUserPosts } from "~/data/user"
import { PostLists } from "../../components/PostLists"

export type P = {
    query: CreateQueryResult<PostResponse[], Error>
}

export function Replies() {
    const query = useReplies()
    return (
        <PostLists query={query} />
    )
}
export function UserPosts () {
    const query = useUserPosts()
    return (
        <PostLists query={query} />
    )
}
