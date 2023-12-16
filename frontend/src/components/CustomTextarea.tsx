import { JSX, Show, createSignal, mergeProps } from "solid-js";
import titleCase from "~/lib/titleCase";
import styles from "~/styles/components/form.module.scss";
import { CharacterCounter } from "./CharacterCounter";
import { Require } from "~/lib/utilityTypes";

type Props = JSX.InputHTMLAttributes<HTMLTextAreaElement> & {
    name: string
}

export function CustomTextarea(props: Props) {
    const merged = mergeProps({ label: props.name, required: true }, props);
    return (
        <div class={styles.formControl}>
            <textarea {...merged} id={merged.name} placeholder=" " />
            <label for={merged.name}>
                {titleCase(merged.name)}
                <Show when={merged.required}>*</Show>
            </label>
        </div>
    );
}

export function TextareaWithCounter(props: Require<Props, 'maxLength'>) {
    const [input, setInput] = createSignal(typeof props.value == 'string' ? props.value : "")
    const merged = mergeProps({ label: props.name, required: true }, props)
    return (
        <>
            <div class={styles.formControl}  >
                <textarea {...merged} id={merged.name} placeholder=" " value={input()} oninput={e => setInput(e.target.value)} />
                <label for={merged.name}>
                    {titleCase(merged.name)}
                    <Show when={merged.required}>*</Show>
                </label>
            </div>
            <CharacterCounter
                inputLength={input().length}
                max={Number(merged.maxLength)}
            />
        </>
    )
}