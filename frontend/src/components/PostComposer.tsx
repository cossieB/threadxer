import { Show, createSignal, onMount } from "solid-js";
import styles from "~/styles/components/Composer.module.scss"
import { CloseBtn } from "./shared/CloseBtn";
import { SubmitButton } from "./shared/SubmitButton";
import clickOutside from "~/lib/clickOutside";
import { CharacterCounter } from "./CharacterCounter";
import { Portal } from "solid-js/web";
import { Popup } from "./shared/Popup";
import { composerState } from "~/globalState/composer";
import { QuoteBox } from "./PostBox/PostBox";
import { usePost } from "~/data/post";
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
    const {mutation} = usePost()

    return (
        <div class={styles.composer} >
            <div use:clickOutside={composerState.close}>
                <div class={styles.top}>
                    <CloseBtn onclick={composerState.close} />
                </div>
                <Show when={!!composerState.replyTo}>
                    <QuoteBox originalPost={composerState.replyTo!} />
                </Show>
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
                        onclick={() => mutation.mutate({
                            text: input(),
                            quotedPost: composerState.quotedPost?.postId,
                            replyTo: composerState.replyTo?.postId
                        })}
                    />
                </div>
                <div class={styles.preview} innerHTML={preview()} />
                <Show when={!!composerState.quotedPost}>
                    <QuoteBox originalPost={composerState.quotedPost!} />
                </Show>
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