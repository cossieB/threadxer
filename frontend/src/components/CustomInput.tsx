import { JSX, Show, mergeProps } from "solid-js"
import titleCase from "~/lib/titleCase"
import styles from "~/styles/components/form.module.scss"

type Props = JSX.InputHTMLAttributes<HTMLInputElement> & {
    name: string
}

export function CustomInput(props: Props) {
    const merged = mergeProps({ label: props.name, required: true }, props)
    return (
        <div class={styles.formControl}  >
            <input {...merged} id={merged.name} placeholder=" " />
            <label for={merged.name}>
                {titleCase(merged.name)}
                <Show when={merged.required}>
                    *
                </Show>
            </label>
        </div>
    )
}

type P2 = JSX.InputHTMLAttributes<HTMLTextAreaElement> & {
    name: string
}


export function CustomTextarea(props: P2) {
    const merged = mergeProps({ label: props.name, required: true }, props)
    return (
        <div class={styles.formControl}  >
            <textarea {...merged} id={merged.name} placeholder=" " />
            <label for={merged.name}>
                {titleCase(merged.name)}
                <Show when={merged.required}>
                    *
                </Show>
            </label>
        </div>
    )
}