import { JSXElement } from "solid-js"
import styles from "~/styles/components/PostBox.module.scss"

type Props = {
    icon: JSXElement,
    number: number
    onClick?: () => void
    color?: string
}

export default function StatIcon(props: Props) {
    return (
        <div class={styles.action}
            style={{ '--color': props.color }}
            onclick={(e) => {
                props.onClick && props.onClick();
                e.stopPropagation()
            }}
        >
            {props.icon}
            <span>
                {Intl.NumberFormat('en-za', { notation: 'compact' }).format(props.number)}
            </span>
        </div>
    )
}