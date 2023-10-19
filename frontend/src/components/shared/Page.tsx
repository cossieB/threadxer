import { useLocation, useNavigate } from "@solidjs/router"
import { onMount, type JSXElement, createSignal } from "solid-js"
import { Popup } from "../Popup"

type Props = {
    title: string
    children: JSXElement
}

export default function Page(props: Props) {
    const location = useLocation();
    const navigate = useNavigate(); console.log(location)
    onMount(() => {
        document.title = `${props.title} / Threader`
    })
    return (
        <main>
            <Popup
                text={(location.state as any)?.msg}
                close={() => navigate("", { state: {}})}
                when={(location.state as any)?.msg}
                colorDeg="270"
            />
            {props.children}
        </main>
    )
}