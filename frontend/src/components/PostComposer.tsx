import { Show, createSignal, onCleanup, onMount } from "solid-js";
import styles from "~/styles/components/Composer.module.scss"
import { CloseBtn } from "./shared/buttons/Buttons";
import { SubmitButton } from "./shared/buttons/SubmitButton";
import clickOutside from "~/lib/clickOutside";
import { CharacterCounter } from "./CharacterCounter";
import { Portal } from "solid-js/web";
import { Popup } from "./shared/Popup";
import { composerState } from "~/globalState/composer";
import { QuoteBox } from "./PostBox/PostBox";
import { usePost } from "~/data/post";
import DropZone from "./DropZone";
false && clickOutside

export function PostComposer() {
    let textarea!: HTMLTextAreaElement

    onMount(() => {
        textarea.focus()
    })
    onCleanup(() => {
        cleanUpUrls()
    })

    const [input, setInput] = createSignal("");
    const [files, setFiles] = createSignal<{ url: string, file: File }[]>([])

    const cleanUpUrls = () => files().forEach(file => URL.revokeObjectURL(file.url))
    
    const preview = () => {
        const rgx = /(?<=\s|^)([#@]\w+)(?=\s|$)/g
        let str = input();
        str = str.replace(rgx, `<span class="${styles.special}">$1</span>`)
        return str
    }
    const { mutation } = usePost()

    return (
        <div class={styles.composer} >
            <div use:clickOutside={composerState.close}>
                <div class={styles.top}>
                    <CloseBtn onclick={composerState.close} />
                </div>
                <Show when={!!composerState.replying}>
                    <QuoteBox
                        originalPost={composerState.replying!.post!}
                        originalPostAuthor={composerState.replying!.author!}
                    />
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
                            quotedPost: composerState.quoting?.post?.postId,
                            replyTo: composerState.replying?.post?.postId,
                            media: files().map(data => data.file)
                        })}
                    />
                </div>
                <div class={styles.preview} innerHTML={preview()} />
                <DropZone setImages={setFiles} images={files()} />
                <Show when={!!composerState.quoting}>
                    <QuoteBox
                        originalPost={composerState.quoting!.post!}
                        originalPostAuthor={composerState.quoting!.author!}
                    />
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