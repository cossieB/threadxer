import { A } from "@solidjs/router"
import { For, Switch, Match } from "solid-js"
import { PostResponse } from "~/data/post"
import { setComposerState } from "~/globalState/composer"
import { formatDate } from "~/lib/formatDate"
import styles from "~/styles/components/PostBox.module.scss"
import { CommentSvg, LikeSvg, RepostSvg, QuoteSvg, ViewsSvg } from "~/svgs"
import { formatPostTime } from "~/utils/formatPostTime"
import StatIcon from "../ActionIcon"
import { useLikes } from "~/data/likes"
import { useRepost } from "~/data/repost"

type Props = { post: PostResponse }

type P1 = {
    username: string,
    displayName: string,
    dateCreated: Date
}

export function PostBoxHeader(props: P1) {
    return (
        <div class={styles.header} >
            <A href={`/users/${props.username}`} >
                <span class={styles.username} > {props?.username} </span> &nbsp;
                <span class={styles.displayName} > @{props?.displayName} </span>
            </A>
            <span class={styles.date} title={formatDate(props.dateCreated)} >
                {formatPostTime(props.dateCreated)}
            </span>
        </div>
    )
}
type P2 = {
    text: string
}
export function PostBoxContent(props: P2) {
    return (
        <div class={styles.content}>
            <For each={props.text.split(" ")} >
                {word => <PostFormatter str={word} />}
            </For>
        </div>
    )
}

export function PostBoxButtons(props: Props) {
        const likeMutation = useLikes()
    const repostMutation = useRepost()

    return (
        <div class={styles.btns} >
            <StatIcon
                icon={<CommentSvg />}
                number={0}
                color="rgb(29, 155, 240)"
                onClick={() => setComposerState({
                    isOpen: true,
                    replying: {
                        post: props.post.post,
                        author: props.post.user
                    }
                })}
            />
            <StatIcon
                icon={<LikeSvg />}
                number={props.post.likes}
                color="rgb(249, 24, 128)"
                onClick={() => likeMutation.mutate(props.post.post.postId)}
                highlight={props.post.liked}
            />
            <StatIcon
                icon={<RepostSvg />}
                number={props.post.reposts}
                color="rgb(0,186,124)"
                onClick={() => repostMutation.mutate(props.post.post.postId)}
                highlight={props.post.reposted}
            />
            <StatIcon
                icon={<QuoteSvg />}
                number={0}
                color="rgb(29, 155, 240)"
                onClick={() => {
                    setComposerState({
                        isOpen: true,
                        quoting: {
                            post: props.post.post,
                            author: props.post.user
                        }
                    })
                }}
            />
            <StatIcon
                icon={<ViewsSvg />}
                number={props.post.post.views}
            />
        </div>
    )
}

function PostFormatter(props: { str: string }) {
    return (
        <Switch fallback={props.str + " "}>
            <Match when={/(?:\s|^)(#\w+)(\s|$)/.test(props.str)}>
                <A href={`/search?hashtag=${props.str}`} class={styles.special}>{props.str}</A>{" "}
            </Match>
            <Match when={/(?:\s|^)(@\w+)(\s|$)/.test(props.str)}>
                <A href={`/users/${props.str.slice(1)}`} class={styles.special}>{props.str}</A>{" "}
            </Match>
        </Switch>
    )
}
