import { For, Show, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { PostResponse } from "~/api/postFetchers";
import styles from "~/styles/components/Media.module.scss"

type P = { media: NonNullable<PostResponse['media']> }

export function MediaList(props: P) {
    const [showSlideshow, setShowSlideshow] = createSignal(false)
    return (
        <div class={styles.container}>
            <For each={props.media}>
                {m => <Media m={m} />}
            </For>
            <Show when={showSlideshow()}>
                {/* <Slideshow i={} /> */}
            </Show>
        </div>
    )
}

type P1 = {
    m: {
        url: string;
        is_video: boolean;
    }
}

function Media(props: P1) {
    return (
        <Show
            when={props.m.is_video}
            fallback={<img src={props.m.url} />}
        >
            <video
                src={props.m.url}
                controls
            />
        </Show>
    )
}

function Slideshow(props: P & { i?: number }) {
    return (
        <Portal>
            <div class={styles.slideshow} >
                <For each={props.media}>
                    {m => <Media m={m} />}
                </For>
            </div>
        </Portal>
    )
}
