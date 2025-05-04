import { useParams } from "@solidjs/router";
import { JSX, Match, Switch } from "solid-js";
import NotFound from "#client/components/404.js";
import { PostBox } from "#client/components/PostBox/PostBox.js";
import { Tabs } from "#client/components/Tabs.js";
import Loader from "#client/components/shared/Loader/Loader.js";
import Page from "#client/components/shared/Page.js";
import { usePost } from "#client/data/post.js";

export function PostPage(props: {children?: JSX.Element}) {
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
            {props.children}
        </Page>
    )
}