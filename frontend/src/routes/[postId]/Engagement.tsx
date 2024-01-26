import { CreateQueryResult } from "@tanstack/solid-query"
import { PostLists } from "~/components/PostLists"
import { useEngagement } from "~/data/engagement"
import { PostResponse } from "~/api/postFetchers"

type P = {
    query: CreateQueryResult<PostResponse[], Error>
}

export function PostReplies() {
    const query = useEngagement('replies')
    return <PostLists query={query} />
}

export function PostQuotes() {
    const query = useEngagement('quotes')
    return <PostLists query={query} />
}