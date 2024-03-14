import { splitProps, type JSX } from "solid-js";
import styles from "~/styles/components/shared/Buttons.module.scss";

type P = {
    children: JSX.Element
    class: "round" | "transparent"
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

export function CustomBtn(props: P) {
    const [p, others] = splitProps(props, ['children'])
    return (
        <button ref={props.ref} onclick={props.onclick} {...others} class={styles[props.class]}>
            {p.children}
        </button>
    )
}