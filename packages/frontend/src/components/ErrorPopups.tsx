import { For, createMemo, onCleanup } from "solid-js";
import { errors, setErrors } from "~/globalState/popups";
import styles from "~/styles/components/ErrorPopups.module.scss"
import { TransitionGroup } from "solid-transition-group";

export function Toast() {
    return (
        <div class={styles.errors}>
            <TransitionGroup name="slide">
                <For each={errors.list}>
                    {(_, i) =>
                        <Err
                            i={i()}
                        />
                    }
                </For>
            </TransitionGroup>
        </div>
    )
}

type Props = {
    i: number
    colorDeg?: string,
    y?: number
}

function Err(props: Props) {
    let ref!: HTMLDivElement;
    const error = createMemo(() => errors.list[props.i])
    const setError = (obj: Partial<typeof errors['list'][number]>) => setErrors('list', props.i, obj)

    const timer = () => {
        if (error().time < 5)
            setError({ time: error().time + 1 });
        else
            errors.removeError(error().message);
    };
    let t = setInterval(timer, 1000)

    onCleanup(() => {
        clearInterval(t)
    })
    return (
        <div
            ref={ref}
            style={{
                "--popClr": props.colorDeg,
                '--time': error().time
            }}
            onMouseOver={() => clearInterval(t)}
            onMouseLeave={() => {
                t = setInterval(timer, 1000)
            }}
        >
            {error().message}
        </div>
    )
}