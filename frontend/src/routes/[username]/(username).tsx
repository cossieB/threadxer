import { useParams } from "@solidjs/router";
import { JSX, Match, Show, Switch } from "solid-js";
import NotFound from "~/components/404";
import { BioIcons } from "~/components/BioIcons";
import { Tabs } from "~/components/Tabs";
import Loader from "~/components/shared/Loader/Loader";
import Page from "~/components/shared/Page";
import { useUser } from "~/data/user";
import styles from "~/styles/routes/[username].module.scss"
import { LinkSvg, LocationSvg } from "~/svgs";

export default function UserPage(props: {children?: JSX.Element}) {
    const params = useParams();
    const { query } = useUser(params.username);
    
    return (
        <Page title={params.username}>
            <Switch>
                <Match when={query.isLoading}>
                    <Loader />
                </Match>
                <Match when={query.isError && query.error.message.includes("No user with that username exists")}>
                    <NotFound />
                </Match>
                <Match when={query.isError}>
                    Error
                </Match>
                <Match when={query.isSuccess}>
                    <div class={styles.userImages} style={{ 'background-image': `url(${query.data?.banner})` }} >
                        <div class={styles.avatar} style={{ 'background-image': `url(${query.data?.avatar})` }} />
                    </div>
                    <div class={styles.btns}>
                        <button>Follow</button>
                    </div>
                    <div class={styles.user}>
                        <span>{query.data?.displayName}</span> <br />
                        <span>@{query.data?.username}</span>
                    </div>
                    <div class={styles.bio}>
                        {query.data?.bio}
                    </div>
                    <div class={styles.icons} >
                        <Show when={query.data?.location}>
                            <BioIcons
                                icon={<LocationSvg />}
                                text={query.data?.location ?? ""}
                            />
                        </Show>
                        <Show when={query.data?.website}>
                            <BioIcons
                                icon={<LinkSvg />}
                                href={query.data?.website ?? ""}
                            />
                        </Show>
                    </div>
                    <Tabs arr={[{ label: "posts", path: "/" }, "replies", "media", "likes"]} url={`users/${params.username}`} />
                </Match>
            </Switch>
            {props.children}
        </Page>
    )
}

