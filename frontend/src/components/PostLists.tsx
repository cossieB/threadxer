import { Switch, Match, For, Show, onMount, onCleanup } from "solid-js";
import { PostBox } from "~/components/PostBox/PostBox";
import Loader from "~/components/shared/Loader/Loader";
import { P } from "../routes/[username]/Replies";
import { MoreDataBtn } from "./MoreDataBtn";
import { useViewPost } from "~/data/engagement";
import { filterMap } from "~/lib/filterMap";

/** key is postId and value is whether the view has been sent to the backend */
export const viewedPosts: Record<string, boolean> = {}

export function PostLists(props: P) {
    const viewMutation = useViewPost()
    let t: NodeJS.Timeout | undefined
    onMount(() => {
        t = setInterval(() => {
            // Send viewed posts to the backend every 10 seconds
            const entries = Object.entries(viewedPosts);
            const postIds = filterMap(entries, val => !val[1], val => val[0])
            if (postIds.length == 0) return;
            viewMutation.mutate(postIds);
            for (const key in viewedPosts) {
                viewedPosts[key] = true
            }
        }, 1000 * 10)
    })
    onCleanup(() => clearInterval(t))
    return (
        <Switch>
            <Match when={props.query.isError}>
                <p>Couldn't load posts. Please try again</p>
            </Match>
            <Match when={props.query.isLoading}>
                <Loader />
            </Match>
            <Match when={props.query.isSuccess}>
                <For each={props.query.data?.pages}>
                    {page =>
                        <For each={page.posts}>
                            {post => <PostBox post={post ?? []} />}
                        </For>
                    }
                </For>
                <MoreDataBtn query={props.query} text="posts" />
            </Match>
        </Switch>
    );
}