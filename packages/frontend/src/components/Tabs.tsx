import { A, useLocation } from "@solidjs/router";
import { For, Setter, createSignal } from "solid-js";
import titleCase from "~/lib/titleCase";
import styles from "~/styles/components/Tabs.module.scss"

type O = {
    label: string,
    path: string
}

type Props = {
    arr: (string | O)[];
    url: string;
};
export function Tabs(props: Props) {
    const [i, setI] = createSignal(0)
    return (
        <nav class={styles.tabs} style={{'--i': i(), '--count': props.arr.length}}>
            <For each={props.arr}>
                {(tab, i) =>
                    <Tab
                        prefix={props.url}
                        tab={tab}
                        i={i()}
                        setI={setI}
                    />
                }
            </For>
        </nav>
    );
}

type P = {
    tab: O | string;
    prefix: string;
    i: number,
    setI: Setter<number>
};

function Tab(props: P) {
    const location = useLocation()
    const label = typeof props.tab == 'string' ? props.tab : props.tab.label
    const path = typeof props.tab == 'string' ? props.tab : props.tab.path

    if (location.pathname.toLowerCase().includes(label))
        props.setI(props.i)

    return (
        <div class={styles.tab}>
            <A href={`/${props.prefix}/${path}`} onClick={() => props.setI(props.i)} >
                {titleCase(label)}
            </A>
        </div>
    )
}