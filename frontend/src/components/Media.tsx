import { For, Match, Show, Switch } from "solid-js";
import { PostResponse } from "~/api/postFetchers";
import styles from "~/styles/components/Media.module.scss"

type P = { media: NonNullable<PostResponse['media']> }

export function Media(props: P) {
    return (
        <div class={styles.container}>
            <For each={props.media}>
                {m =>
                    <Show
                        when={m.is_video}
                        fallback={<img src={m.url} />}
                    >
                        <video
                            src={m.url}
                            controls
                        />
                    </Show>
                }
            </For>
        </div>
    )
}