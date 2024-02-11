import { PostLists } from "~/components/PostLists"
import { usePostLikes, useQuotes } from "~/data/engagement"
import { For, Match, Switch } from "solid-js"
import Loader from "~/components/shared/Loader/Loader"
import { UserCard } from "~/components/UserCard"
import { useReplies } from "~/data/replies"

export function PostReplies() {
    const query = useReplies()
    return <PostLists query={query} />
}

export function PostQuotes() {
    const query = useQuotes()
    return <PostLists query={query} />
}

export function PostLikes() {
    const query = usePostLikes()
    return (
        <Switch>
            <Match when={query.isLoading}>
                <Loader />
            </Match>
            <Match when={query.isError}>
                Something went wrong
            </Match>
            <Match when={query.isSuccess}>
                <For each={query.data}>
                    {user => <UserCard {...user} />}
                </For>
            </Match>
        </Switch>
    )
}