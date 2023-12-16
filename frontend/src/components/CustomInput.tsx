import { For, JSX, Show, createSignal, mergeProps } from "solid-js"
import titleCase from "~/lib/titleCase"
import styles from "~/styles/components/form.module.scss"
import { CharacterCounter } from "./CharacterCounter"

type Props = JSX.InputHTMLAttributes<HTMLInputElement> & {
    name: string,
    validationErrors?: string[]
    validatorFn?: (value: string) => void
    clearErrors?: () => void
} & ({
    showCounter: true
    maxlength: number
} | {
    showCounter?: false
    maxlength?: number | string
})

export function CustomInput(props: Props) {
    const [input, setInput] = createSignal("")
    const merged = mergeProps({
        label: props.name,
        required: true,
        validationErrors: [] as string[],
        autocomplete: "off"
    }, props)
    const errored = () => merged.validationErrors.length > 0
    return (
        <>
            <div class={styles.formControl} classList={{ [styles.error]: errored() }} >
                <input
                    {...merged}
                    id={merged.name}
                    placeholder=" "
                    onchange={e => {
                        setInput(e.target.value.trim());
                        if (input().length === 0 && merged.clearErrors)
                            merged.clearErrors()
                        else if (merged.validatorFn)
                            merged.validatorFn(e.target.value)
                    }}
                    oninput={e => {
                        setInput(e.target.value)
                        merged.clearErrors && merged.clearErrors()
                    }}
                />
                <label for={merged.name}>
                    {titleCase(merged.name)}
                    <Show when={merged.required}>*</Show>
                </label>
            </div>
            <Show when={props.showCounter}>
                <CharacterCounter
                    inputLength={input().length}
                    max={props.maxlength as number}
                />
            </Show>
            <Show when={merged.validationErrors.length > 0}>
                <ul>
                    <For each={merged.validationErrors}>
                        {error => <li> {error} </li>}
                    </For>
                </ul>
            </Show>
        </>
    )
}

export function InputWithCounter(props: Props) {
    const [input, setInput] = createSignal("")
    const merged = mergeProps({ label: props.name, required: true }, props)
    return (
        <div class={styles.formControl}  >
            <input {...merged} id={merged.name} placeholder=" " value={input()} oninput={e => setInput(e.target.value)} />
            <label for={merged.name}>
                {titleCase(merged.name)}
                <Show when={merged.required}>*</Show>
            </label>
            <CharacterCounter
                inputLength={input().length}
                max={Number(merged.maxLength) ?? 255}
            />
        </div>
    )
}