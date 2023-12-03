import { mergeProps } from "solid-js"
import { CloseSvg } from "~/svgs"
import styles from "~/styles/components/shared/ClosedBtn.module.scss"

type Props = {
    onclick: () => void
}

export function CloseBtn(props: Props) {
    
    return (
        <button class={styles.btn} onclick={props.onclick}>
            <CloseSvg />
        </button>
    )
}