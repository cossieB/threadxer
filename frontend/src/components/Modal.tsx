import type { JSXElement } from 'solid-js';
import { Portal, Show } from 'solid-js/web';

type P = {
    children: JSXElement
    when: boolean
}

export default function Modal(props: P) {

    return (
        <Show when={props.when}>
            <Portal ref={el => el.classList.add('modal')} >
                {props.children}
            </Portal>
        </Show>
    )
}