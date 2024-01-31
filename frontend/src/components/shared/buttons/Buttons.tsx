import { CloseSvg } from "~/svgs"
import styles from "~/styles/components/shared/Buttons.module.scss"
import { RoundBtn } from "./RoundBtn"
import { JSX } from "solid-js"
import { Require } from "~/lib/utilityTypes"

type Props = Require<JSX.HTMLAttributes<HTMLButtonElement>, 'onclick'>

export function CloseBtn(props: Props) {
    return (
        <RoundBtn {...props}>
            <CloseSvg />
        </RoundBtn>
    )
}
