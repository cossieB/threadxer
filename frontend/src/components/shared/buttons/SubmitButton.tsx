import { type JSX, Match, Switch } from "solid-js"
import Loader from "../Loader/Loader"
import styles from "~/styles/components/form.module.scss"

type Props = {
    text?: string
    loading: boolean
    disabled?: boolean
    finished: boolean
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

export function SubmitButton(props: Props) {
    return (
        <button
            {...props}
            type={props.type ?? 'submit'}
            class={styles.submitBtn}
            disabled={props.disabled || props.loading || props.finished}
        >
            <Switch fallback={props.text || "Submit"} >
                <Match when={props.loading}>
                    <Loader />
                </Match>
                <Match when={props.finished}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                    </svg>
                </Match>
            </Switch>
        </button>
    )
}

export function ActionButton() {
    
}