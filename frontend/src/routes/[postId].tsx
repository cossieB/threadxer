import { Match, Switch } from "solid-js";
import NotFound from "~/components/404";
import { PostBox } from "~/components/PostBox/PostBox";
import Loader from "~/components/shared/Loader/Loader";
import Page from "~/components/shared/Page";
import { usePost } from "~/data/post";

export function PostPage() {

    const {postQuery} = usePost()

    return (
        <Switch>
            <Match when={postQuery.isLoading}>
                <Loader />
            </Match>
            <Match when={postQuery.isError && postQuery.error.message.includes("post doesn't exist")}>
                <NotFound />
            </Match>
            <Match when={postQuery.isError}>
                {postQuery.error?.message}
            </Match>
            <Match when={postQuery.isSuccess}>
                <Page title={postQuery.data?.post.postId!}>
                    <PostBox post={postQuery.data!} />
                </Page>
            </Match>
        </Switch>
    )
}