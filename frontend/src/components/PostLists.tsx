import { Switch, Match, For, Show } from "solid-js";
import { PostBox } from "~/components/PostBox/PostBox";
import Loader from "~/components/shared/Loader/Loader";
import { P } from "../routes/[username]/Replies";
import { MoreDataBtn } from "./MoreDataBtn";

export function PostLists(props: P) {

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

