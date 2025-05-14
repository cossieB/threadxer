import { type JSX } from "solid-js"
import styles from '~/styles/components/form.module.scss'

type P = {
    children: JSX.Element
    onsubmit(e: SubmitEvent): void
    ref?: HTMLFormElement
}

export default function UserForm(props: P) {
    return (
        <form onsubmit={props.onsubmit} class={styles.form} ref={props.ref}>
            {props.children}
        </form>
    )
}