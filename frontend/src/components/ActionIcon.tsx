import { JSXElement } from "solid-js"
import styles from "~/styles/components/PostBox.module.scss"

type Props = {
    icon: JSXElement,
    text: string | number
    onClick?: () => void
    color?: string
}

export default function ActionIcon(props: Props) {
    return (
        <div class={styles.action} style={{'--color': props.color}} onclick={props.onClick}>
            {props.icon}
            <span> {props.text} </span>
        </div>
    )
}