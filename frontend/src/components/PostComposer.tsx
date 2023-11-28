import { For, Match, Show, Switch, createSignal, onMount } from "solid-js";
import styles from "~/styles/components/Composer.module.scss"
import { CloseSvg } from "~/svgs";

export function PostComposer() {
    let ref!: HTMLDivElement
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
    return (
        <div class={styles.composer}>
            <div class={styles.top}            >
                <button>
                    <CloseSvg />
                </button>
            </div>
            <textarea
                oninput={e => setInput(e.target.value)}
                maxLength={255}
                ref={textarea}
            />
            <svg height={20} width="95%">
                <rect x={0} y={0} height={20} width="100%" fill="none" stroke-width={2} stroke="black" />
                <rect x={0} y={0} height={20} width={`${input().length / 255 * 100}%`} />
                <text x={50} y={50} fill="white"> {input().length} </text>
            </svg>
            <div class={styles.preview} innerHTML={preview()} />
            <button onclick={() => console.log(ref.textContent?.length)}>
                DO TI
            </button>
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