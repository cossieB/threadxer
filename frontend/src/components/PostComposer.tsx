import { Match, Switch, createSignal, onMount } from "solid-js";
import styles from "~/styles/components/Composer.module.scss"
import { CloseBtn } from "./shared/CloseBtn";
import { SubmitButton } from "./shared/SubmitButton";
import { setComposerOpen } from "~/App";
import clickOutside from "~/lib/clickOutside";
false && clickOutside

export function PostComposer() {
    let textarea!: HTMLTextAreaElement
    onMount(() => {
        textarea.focus()
    })
    const [input, setInput] = createSignal("")
    const preview = () => {
        const rgx = /(?<=\s|^)([#@]\w+)(?=\s|$)/g
        let str = input();
        str = str.replace(rgx, `<span class="${styles.special}">$1</span>`)
        return str
    }
    const radius = 15
    const circumference = 2 * Math.PI * radius
    return (
        <div class={styles.composer} >
            <div use:clickOutside={() => setComposerOpen(false)}>
                <div class={styles.top}>
                    <CloseBtn onclick={() => {setComposerOpen(false)}} />
                </div>
                <textarea
                    oninput={e => setInput(e.target.value)}
                    maxLength={255}
                    ref={textarea}
                />
                <div class={styles.bottom}>
                    <svg height={2 * radius + 10} width={2 * radius + 10}>
                        <circle cx="50%" cy="50%" r={radius} stroke-dasharray={`${circumference} ${circumference}`} fill="none" stroke="gray" stroke-width={5} />
                        <circle cx="50%" cy="50%" r={radius} stroke-dasharray={`${input().length / 255 * circumference} ${circumference}`} fill="none" stroke="var(--blue1)" stroke-width={5} />
                    </svg>
                    <SubmitButton
                        disabled={input().length === 0}
                        finished={false}
                        loading={false}
                    />
                </div>
                <div class={styles.preview} innerHTML={preview()} />
            </div>
        </div>
    );
}

function FormatText(props: { str: string }) {
    return (
        <Switch fallback={props.str + " "}>
            <Match when={/(?:\s|^)(#\w+)(\s|$)/.test(props.str)}>
                <span class={styles.hashtag}>{props.str}</span>{" "}
            </Match>
            <Match when={/(?:\s|^)(@\w+)(\s|$)/.test(props.str)}>
                <span class={styles.at}>{props.str}</span>{" "}
            </Match>
        </Switch>
    )
}
