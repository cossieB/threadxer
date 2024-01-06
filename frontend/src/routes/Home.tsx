import { For, Match, Switch } from "solid-js"
import { PostBox } from "~/components/PostBox/PostBox"
import Loader from "~/components/shared/Loader/Loader"
import Page from "~/components/shared/Page"
import { usePost } from "~/data/post"

export default function Home() {
    const {allPostsQuery} = usePost()
    return (
        <Page title="Home">
            <Switch>
                <Match when={allPostsQuery.isLoading}>
                    <Loader />
                </Match>
                <Match when={allPostsQuery.isError}>
                    ERROR
                </Match>
                <Match when={allPostsQuery.isSuccess}>
                    <For each={allPostsQuery.data ?? []} >
                        {post => <PostBox post={post} /> }
                    </For>
                </Match>

            </Switch>
        </Page>
    )
}

