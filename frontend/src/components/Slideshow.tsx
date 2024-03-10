import { For, Show, onMount } from "solid-js";
import { Portal } from "solid-js/web";
import styles from "~/styles/components/Media.module.scss";
import { CustomBtn } from "./shared/buttons/CustomButtons";
import { Transition, TransitionGroup } from "solid-transition-group";
import { P, Media } from "./Media";
import clickOutside from "~/lib/clickOutside";
false && clickOutside

type P2 = {
    i: number;
    close(): void;
    changeSlide(num: number): void;
} & P;

export function Slideshow(props: P2) {
    let prevBtn: HTMLButtonElement | undefined
    let nextBtn: HTMLButtonElement | undefined
    let direction = 1;

    function handleKeyup(e: KeyboardEvent) {
        if (e.key == 'ArrowLeft')
            prevBtn?.click()
        if (e.key  == 'ArrowRight')
            nextBtn?.click()
        if (e.key == 'Escape')
            props.close()
    }

    onMount(() => document.addEventListener('keyup', handleKeyup))

    return (
        <Portal ref={el => el.classList.add('modal')}>
            <div class={styles.slideshow} use:clickOutside={props.close}>
                <Show when={props.i !== 0}>
                    <CustomBtn
                        onclick={() => {
                            direction = 1;
                            props.changeSlide(-1);
                        }}
                        data-btn="prev"
                        ref={prevBtn}
                        class="round"
                    >
                        ←
                    </CustomBtn>
                </Show>
                <Transition
                    onEnter={(el, done) => {
                        const a = el.animate([{ transform: `translateX(${-direction * 100}vw)` }, { transform: "translateX(0)" }], {
                            duration: 250
                        });
                        a.finished.then(done);
                    }}
                    onExit={(el, done) => {
                        const a = el.animate([{ transform: "translateX(0)" }, { transform: `translateX(${direction * 100}vw)` }], {
                            duration: 250
                        });
                        a.finished.then(done);
                    }}
                >
                    <For each={props.media}>
                        {(m, i) => 
                            <Show when={props.i == i()}>
                                <Media m={m} />
                            </Show>
                        }
                    </For>
                </Transition>
                <Show when={props.i !== props.media.length - 1}>
                    <CustomBtn
                        onclick={() => {
                            direction = -1;
                            props.changeSlide(1);
                        }}
                        data-btn="next"
                        ref={nextBtn}
                        class="round"
                    >
                        →
                    </CustomBtn>
                </Show>
            </div>
        </Portal>
    );
}
