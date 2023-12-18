import { Match, Switch, createSignal, onMount } from "solid-js";
import styles from "~/styles/components/Composer.module.scss"
import { CloseBtn } from "./shared/CloseBtn";
import { SubmitButton } from "./shared/SubmitButton";
import { setComposerOpen } from "~/App";
import clickOutside from "~/lib/clickOutside";
import { CharacterCounter } from "./CharacterCounter";
import { usePostMutation } from "~/models/post";
import { useQueryClient } from "@tanstack/solid-query";
import { Portal } from "solid-js/web";
import { Popup } from "./shared/Popup";
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
    const queryClient = useQueryClient()
    const mutation = usePostMutation(queryClient)

    return (
        <div class={styles.composer} >
            <div use:clickOutside={() => setComposerOpen(false)}>
                <div class={styles.top}>
                    <CloseBtn onclick={() => { setComposerOpen(false) }} />
                </div>
                <textarea
                    oninput={e => setInput(e.target.value)}
                    maxLength={180}
                    ref={textarea}
                />
                <div class={styles.bottom}>
                    <CharacterCounter
                        inputLength={input().length}
                        max={180}
                    />
                    <SubmitButton
                        disabled={input().length === 0}
                        finished={mutation.isSuccess}
                        loading={mutation.isPending}
                        onclick={() => mutation.mutate({text: input()})}
                    />
                </div>
                <div class={styles.preview} innerHTML={preview()} />
            </div>
            <Portal>
                <Popup
                    close={mutation.reset}
                    text={mutation.error?.message ?? ""}
                    when={mutation.isError}
                />
            </Portal>
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

