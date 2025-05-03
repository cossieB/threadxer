import { Switch, Match, onMount, onCleanup } from "solid-js";
import Loader from "~/components/shared/Loader/Loader";
import { CustomBtn } from "./shared/buttons/CustomButtons";
import { DownArrow } from "~/svgs";
import { CreateInfiniteQueryResult } from "@tanstack/solid-query";

type Props = {
    query: CreateInfiniteQueryResult;
    text: string
};

export function MoreDataBtn(props: Props) {
    let ref!: HTMLButtonElement;
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {

            if (entry.isIntersecting) {
                props.query.fetchNextPage();
            }
        });
    }, { threshold: 0.25 });
    onMount(() => {
        if (props.query.hasNextPage)
            observer.observe(ref);
    });
    onCleanup(() => {
        if (props.query.hasNextPage)
            observer.unobserve(ref);
    });

    return (
        <div class="flexCenter" style={{ height: '3.5rem' }}>
            <Switch>
                <Match when={props.query.isFetchingNextPage}>
                    <Loader />
                </Match>
                <Match when={props.query.hasNextPage}>
                    <CustomBtn ref={ref} style={{ width: '100%' }} class="transparent" onclick={() => props.query.fetchNextPage()}>
                        <DownArrow />
                        Load more {props.text}
                    </CustomBtn>
                </Match>
            </Switch>
        </div>
    );
}
