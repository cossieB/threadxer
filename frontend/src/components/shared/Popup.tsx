import { Show, createSignal, onCleanup } from "solid-js";
import { Transition } from "solid-transition-group";
import styles from "~/styles/components/Popup.module.scss"

type Props = {
    text: string,
    close: () => void,
    colorDeg?: string,
    when: boolean
}

export function Popup(props: Props) {
    return (
        <Transition name="fade" >
            <Show when={props.when}>
                <Alert {...props} />
            </Show>
        </Transition>
    )
}

function Alert(props: Props) {
    const [time, setTime] = createSignal(0)
    const timer = () => {
        if (time() < 5)
            setTime(p => p + 1);
        else
            props.close();
    };
    let t = setInterval(timer, 1000)

    onCleanup(() => {
        clearInterval(t)
    })
    return (
        <div
            class={styles.popup}
            style={{ '--time': time() }}
            onMouseOver={() => clearInterval(t)}
            onMouseLeave={() => {
                t = setInterval(timer, 1000)
            }}
        >
            <div style={{ "--popClr": props.colorDeg ?? 50 }}>
                {props.text}
            </div>
        </div>
    )
}