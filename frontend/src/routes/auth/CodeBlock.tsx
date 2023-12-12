import { Accessor, Setter, onCleanup, onMount } from "solid-js";
import styles from '~/styles/components/VerificationCode.module.scss';

export type P = {
    letter: Accessor<string>
    i: number
    code: string[]
    setCode: Setter<string[]>
}

export function CodeBlock(props: P) {
    let ref!: HTMLDivElement;
    function handleInput(e: KeyboardEvent) {
        if (e.key == "Backspace" || e.key == "Delete") {
            //@ts-expect-error
            props.setCode(props.i, "");
            return;
        }
        const next = ref.nextSibling as HTMLDivElement | null;
        const prev = ref.previousSibling as HTMLDivElement | null;
        if (e.key == "ArrowLeft")
            return prev?.focus();
        if (e.key == "ArrowRight")
            return next?.focus();

        else if (/\D/.test(e.key)) return;
        //@ts-expect-error
        props.setCode(props.i, e.key);
        if (next)
            next.focus();

        else
            document.querySelector('button')?.focus();

    }
    onMount(() => {
        ref.addEventListener('keyup', handleInput);
        onCleanup(() => ref.removeEventListener('keyup', handleInput));
    });
    return (
        <div
            ref={ref}
            tabIndex={0}
            onclick={() => ref.focus()}
            class={styles.code}
            innerText={props.code[props.i]}
            onpaste={(e) => {
                const newArr: string[] = []
                const clipboardData = e.clipboardData?.getData('text')
                if (!clipboardData)
                    return
                for (let i = 0; i < clipboardData.length && i < 6; i++) {
                    const char = clipboardData[i]
                    if (parseInt(char))
                        newArr.push(char)
                }
                if (newArr.length == 6)
                    props.setCode(newArr)
            }}
            onauxclick={e => {
                console.log("HERE")
            }}
        />
    );
}
