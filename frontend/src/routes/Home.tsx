import { For, Match, Switch } from "solid-js"
import { PostBox } from "~/components/PostBox"
import Loader from "~/components/shared/Loader/Loader"
import Page from "~/components/shared/Page"
import {  usePosts } from "~/models/post"

export default function Home() {
    const query = usePosts()
    return (
        <Page title="Home">
            <Switch>
                <Match when={query.isLoading}>
                    <Loader />
                </Match>
                <Match when={query.isError}>
                    ERROR
                </Match>
                <Match when={query.isSuccess}>
                    <For each={query.data ?? []} >
                        {post => <PostBox post={post} /> }
                    </For>
                </Match>

            </Switch>
        </Page>
    )
}

