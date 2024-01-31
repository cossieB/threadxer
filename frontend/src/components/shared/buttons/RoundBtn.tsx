import { splitProps, type JSX } from "solid-js";
import styles from "~/styles/components/shared/Buttons.module.scss";

type P = {
    children: JSX.Element
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

export function RoundBtn(props: P) {
    const [p, others] = splitProps(props, ['children'])
    return (
        <button ref={props.ref} class={styles.round} onclick={props.onclick} {...others}>
            {p.children}
        </button>
    )
}
