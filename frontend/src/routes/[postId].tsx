import { useParams } from "@solidjs/router";
import { Match, Switch } from "solid-js";
import NotFound from "~/components/404";
import { PostBox } from "~/components/PostBox/PostBox";
import { Tabs } from "~/components/Tabs";
import Loader from "~/components/shared/Loader/Loader";
import Page from "~/components/shared/Page";
import { usePost } from "~/data/post";

export function PostPage() {
    const params = useParams()
    const { postQuery } = usePost()

    return (
        <Page title={postQuery.data?.post.postId!}>
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
                    <PostBox post={postQuery.data!} />
                    <Tabs arr={["replies", "quotes", "likes"]} url={`posts/${params.postId}`} />
                </Match>
            </Switch>
        </Page>
    )
}