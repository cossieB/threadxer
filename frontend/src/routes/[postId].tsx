import { useParams } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { Match, Switch } from "solid-js";
import { PostBox } from "~/components/PostBox";
import Loader from "~/components/shared/Loader/Loader";
import Page from "~/components/shared/Page";
import { usePost } from "~/models/post";

export function PostPage() {
    const { postId } = useParams()
    const queryClient = useQueryClient()
    const query = usePost(queryClient, postId)

    return (
        <Switch>
            <Match when={query.isLoading}>
                <Loader />
            </Match>
            <Match when={query.isError}>
                {query.error?.message}
            </Match>
            <Match when={query.isSuccess}>
                <Page title={query.data?.post.postId!}>
                    <PostBox post={query.data!} />
                </Page>
            </Match>
        </Switch>
    )
}