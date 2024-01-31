import { For, Show, createSignal, mergeProps } from "solid-js";
import { Portal } from "solid-js/web";
import { PostResponse } from "~/api/postFetchers";
import clickOutside from "~/lib/clickOutside";
import styles from "~/styles/components/Media.module.scss"
import { RoundBtn } from "./shared/buttons/RoundBtn";
false && clickOutside

type P = { media: NonNullable<PostResponse['media']> }

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
        is_video: boolean;
    },
    i?: number
    openSlideshow?: (i: number) => void
}

function Media(props: P1) {
    const merged = mergeProps(props, { i: 0 })
    return (
        <Show
            when={props.m.is_video}
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

type P2 = {
    i: number,
    close(): void
    changeSlide(num: number): void
} & P

function Slideshow(props: P2) {
    return (
        <Portal ref={el => el.classList.add('modal')}>
            <div class={styles.slideshow} use:clickOutside={props.close}>
                <Show when={props.i !== 0}>
                    <RoundBtn
                        onclick={() => props.changeSlide(-1)}
                        data-btn="prev"
                    >
                        ←
                    </RoundBtn>
                </Show>
                <Media m={props.media[props.i]} />
                <Show when={props.i !== props.media.length - 1}>
                    <RoundBtn
                        onclick={() => props.changeSlide(1)}
                        data-btn="next"
                    >
                        →
                    </RoundBtn>
                </Show>
            </div>
        </Portal>
    )
}
