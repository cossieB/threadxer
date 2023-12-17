import type { JSX } from "solid-js"

type Props = {
    name: string,
    value: JSX.InputHTMLAttributes<HTMLInputElement>['value']
}

export default function HiddenInput(props: Props) {
    return <input type="text" hidden value={props.value} name={props.name} />
}