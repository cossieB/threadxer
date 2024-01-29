import { For, Match, Switch } from "solid-js";
import { PostResponse } from "~/api/postFetchers";
import styles from "~/styles/components/Media.module.scss"

type P = { media: NonNullable<PostResponse['media']> }

export function Media(props: P) {
    return (
        <div class={styles.container}>
            <For each={props.media}>
                {m =>
                    <Switch
                        fallback={<img src={m.url} />}
                    >
                        <Match when={m.isVideo}>
                            <video src={m.url} />
                        </Match>
                    </Switch>
                }
            </For>
        </div>
    )
}