import { Switch, Match, For, Show, onMount, onCleanup } from "solid-js";
import { PostBox } from "~/components/PostBox/PostBox";
import Loader from "~/components/shared/Loader/Loader";
import { P } from "../routes/[username]/Replies";
import { CustomBtn } from "./shared/buttons/CustomButtons";
import { DownArrow } from "~/svgs";
import { CreateInfiniteQueryResult } from "@tanstack/solid-query";

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
                        <For each={page}>
                            {post => <PostBox post={post ?? []} />}
                        </For>
                    }
                </For>
                <Btn query={props.query} />
            </Match>
        </Switch>
    );
}

function Btn(props: { query: CreateInfiniteQueryResult }) {
    let ref!: HTMLButtonElement
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            
            if (entry.isIntersecting) {
                props.query.fetchNextPage()
            }
        });
    }, { threshold: 0.25 })
    onMount(() => observer.observe(ref))
    onCleanup(() => observer.unobserve(ref))

    return (
        <Show  when={!props.query.isFetchingNextPage} fallback={<Loader />}>
            <CustomBtn ref={ref} style={{ width: '100%', padding: '1rem' }} class="transparent" onclick={() => props.query.fetchNextPage()}>
                <DownArrow />
                Load more posts
            </CustomBtn>
        </Show>
    )
}