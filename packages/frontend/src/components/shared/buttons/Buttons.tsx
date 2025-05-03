import { CloseSvg } from "~/svgs"
import { CustomBtn } from "./CustomButtons"
import { JSX } from "solid-js"
import { Require } from "~/lib/utilityTypes"

type Props = Require<JSX.HTMLAttributes<HTMLButtonElement>, 'onclick'>

export function CloseBtn(props: Props) {
    return (
        <CustomBtn {...props} class="round">
            <CloseSvg />
        </CustomBtn>
    )
}

