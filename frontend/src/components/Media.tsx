import { For, Show, createSignal, mergeProps } from "solid-js";
import styles from "~/styles/components/Media.module.scss"
import { Slideshow } from "./Slideshow";
import { PostResponse } from "~/routes/[username]/Replies";

export type P = { media: NonNullable<PostResponse['media']> }

export function MediaList(props: P) {
    const [showSlideshow, setShowSlideshow] = createSignal(false);
    const [index, setIndex] = createSignal(0)

    const openSlideshow = (i: number) => {
        setShowSlideshow(true);
        setIndex(i)
    }
    const changeSlide = (num: number) => setIndex(prev => prev + num)

    return (
        <div class={styles.container}>
            <For each={props.media}>
                {(m, i) => (
                    <>
                        <Media
                            openSlideshow={() => openSlideshow(i())}
                            m={m}
                            i={i()}
                        />
                    </>
                )}
            </For>
            <Show when={showSlideshow()}>
                <Slideshow
                    media={props.media}
                    i={index()}
                    close={() => {
                        setShowSlideshow(false)
                        setIndex(0)
                    }}
                    changeSlide={changeSlide}
                />
            </Show>
        </div>
    )
}

type P1 = {
    m: {
        url: string;
        isVideo: boolean;
    },
    i?: number
    openSlideshow?: (i: number) => void
}

export function Media(props: P1) {
    const merged = mergeProps(props, { i: 0 })
    return (
        <Show
            when={props.m.isVideo}
            fallback={
                <img onclick={() => props.openSlideshow?.(merged.i)} src={props.m.url} />
            }>
            <video
                src={props.m.url}
                controls
                onclick={() => props.openSlideshow?.(merged.i)}
            />
        </Show>
    )
}


