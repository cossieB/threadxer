import { For, Match, Switch } from "solid-js"
import { MediaList } from "~/components/Media"
import Loader from "~/components/shared/Loader/Loader"
import { useUserMedia } from "~/data/user"
import styles from "~/styles/components/UserMedia.module.scss"

export function UserMedia() {
    const query = useUserMedia()
    return (
        <Switch>
            <Match when={query.isError}>
                Could not fetch user media. Please try again later
            </Match>
            <Match when={query.isLoading}>
                <Loader />
            </Match>
            <Match when={query.isSuccess}>
                <div>
                    <MediaList media={query.data ?? []} />
                </div>
            </Match>
        </Switch>
    )
}

