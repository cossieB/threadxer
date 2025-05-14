import { For, onCleanup, onMount } from "solid-js";
import styles from '~/styles/components/Numberpad.module.scss';

type P = {
    enterNumber: (num: string) => void
    deleteNumber(): void
    clear(): void
    isDisabled: boolean
    isMaxed: boolean
}

export function Numberpad(props: P) {
    function handleKeyup(e: KeyboardEvent) {
        if (props.isDisabled)
            return
        if (e.key == "Backspace")
            props.deleteNumber()
        if (props.isMaxed)
            return
        if (/^\d$/.test(e.key)) {
            props.enterNumber(e.key)
            const elem = document.querySelector(`[data-num="${e.key}"]`)
            elem?.classList.add(styles.active)
            setTimeout(() => elem?.classList.remove(styles.active), 50)
        }

    }
    onMount(() => {
        document.addEventListener('keyup', handleKeyup)
        onCleanup(() => document.removeEventListener('keyup', handleKeyup))

    })
    return (
        <div
            class={styles.numberpad}
        >
            <For each={new Array(10).fill(true).map((_, i) => i)}>
                {num => (
                    <div
                        classList={{
                            [styles.maxed]: props.isMaxed,
                            [styles.disabled]: props.isDisabled
                        }}
                        role="button"
                        onclick={() => props.enterNumber(num.toString())}
                        data-num={num}
                        aria-disabled={props.isMaxed || props.isDisabled}
                    >
                        {num}
                    </div>
                )}
            </For>
            <div
                aria-label="backspace"
                classList={{ [styles.disabled]: props.isDisabled }}
                onclick={props.deleteNumber}
            >
                ←
            </div>
            <div
                aria-label="clear"
                classList={{ [styles.disabled]: props.isDisabled }}
                onclick={props.clear}
            >
                C
            </div>
        </div>
    );
}
