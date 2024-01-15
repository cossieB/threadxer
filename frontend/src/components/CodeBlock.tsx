import { Accessor, Setter, onCleanup, onMount } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import styles from '~/styles/components/VerificationCode.module.scss';

export type P = {
    letter: Accessor<string>
    i: number
    code: {
        pointer: number;
        splitUp: string[];
    }
    setCode: SetStoreFunction<{
        pointer: number;
        splitUp: string[];
    }>
}

export function CodeBlock(props: P) {
    let ref!: HTMLDivElement;
    function handleInput(e: KeyboardEvent) {
        // if (e.key == "Backspace" || e.key == "Delete") {
        //     props.setCode('splitUp', props.i, "");
        //     return;
        // }
        // const next = ref.nextSibling as HTMLDivElement | null;
        // const prev = ref.previousSibling as HTMLDivElement | null;
        // if (e.key == "ArrowLeft")
        //     return prev?.focus();
        // if (e.key == "ArrowRight")
        //     return next?.focus();

        // else if (/\D/.test(e.key)) return;
        // props.setCode('splitUp', props.i, e.key);
        // if (next)
        //     next.focus();
        // else
        //     document.querySelector('button')?.focus();

    }
    // onMount(() => {
    //     ref.addEventListener('keyup', handleInput);
    //     onCleanup(() => ref.removeEventListener('keyup', handleInput));
    // });
    return (
        <div
            ref={ref}
            tabIndex={0}
            onclick={() => props.setCode('pointer', props.i)}
            class={styles.code}
            classList={{[styles.focus]: props.i == props.code.pointer}}
            innerText={props.code.splitUp[props.i]}
            onpaste={(e) => {
                const newArr: string[] = []
                const clipboardData = e.clipboardData?.getData('text')
                if (!clipboardData)
                    return
                for (let i = 0; i < clipboardData.length && i < 6; i++) {
                    const char = clipboardData[i]
                    if (/\d/.test(char))
                        newArr.push(char)
                }

                if (newArr.length == 6){
                    props.setCode('splitUp', newArr)
                    props.setCode('pointer', 5)
                }
            }}
            onauxclick={e => {
                
            }}
        />
    );
}
