import { formatDate } from "~/lib/formatDate";
import styles from "~/styles/components/PostBox.module.scss"
import { formatPostTime } from "../utils/formatPostTime";
import { A, useNavigate } from "@solidjs/router";
import { Switch, Match, For } from "solid-js";
import StatIcon from "./ActionIcon";
import { CommentSvg, LikeSvg, QuoteSvg, RepostSvg, ViewsSvg } from "~/svgs";
import { useQueryClient } from "@tanstack/solid-query";
import { setComposerState } from "~/globalState/composer";
import { useLikes } from "~/data/likes";
import { PostResponse } from "~/data/post";
import { useRepost } from "~/data/repost";

export function PostBox(props: { post: PostResponse }) {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const likeMutation = useLikes()
    const repostMutation = useRepost()
    return (

        <div class={styles.box} onclick={() => navigate(`/posts/${props.post.post.postId}`)}>
            <div class={styles.avatar}>
                <img src={props.post.user?.avatar} />
            </div>
            <div class={styles.div} >
                <div class={styles.header} >
                    <A href={`/users/${props.post.user.username}`} >
                        <span class={styles.username} > {props.post.user?.username} </span> &nbsp;
                        <span class={styles.displayName} > @{props.post.user?.displayName} </span>
                    </A>
                    <span class={styles.date} title={formatDate(props.post.post.dateCreated)} >
                        {formatPostTime(props.post.post.dateCreated)}
                    </span>
                </div>
                <div class={styles.content}>
                    <For each={props.post.post.text.split(" ")} >
                        {word => <PostFormatter str={word} />}
                    </For>
                </div>
                <div class={styles.btns} >
                    <StatIcon
                        icon={<CommentSvg />}
                        number={0}
                        color="rgb(29, 155, 240)"
                    />
                    <StatIcon
                        icon={<LikeSvg />}
                        number={props.post.post.likes}
                        color="rgb(249, 24, 128)"
                        onClick={() => likeMutation.mutate(props.post.post.postId)}
                        highlight={props.post.liked}
                    />
                    <StatIcon
                        icon={<RepostSvg />}
                        number={props.post.post.reposts}
                        color="rgb(0,186,124)"
                        onClick={() => repostMutation.mutate(props.post.post.postId)}
                        highlight={props.post.didRepost}
                    />
                    <StatIcon
                        icon={<QuoteSvg />}
                        number={0}
                        color="rgb(29, 155, 240)"
                        onClick={() => {
                            setComposerState({
                                isOpen: true,
                                quotedPost: props.post
                            })
                        }}
                    />
                    <StatIcon
                        icon={<ViewsSvg />}
                        number={props.post.post.views}
                    />
                </div>
            </div>
        </div>
    )
}

export function QuoteBox(props: { post: PostResponse }) {
    return (
        <div class={styles.box}>
            <div class={styles.avatar}>
                <img src={props.post.user?.avatar} />
            </div>
            <div class={styles.div} >
                <div class={styles.header} >
                    <A href={`/users/${props.post.user.username}`} >
                        <span class={styles.username} > {props.post.user?.username} </span> &nbsp;
                        <span class={styles.displayName} > @{props.post.user?.displayName} </span>
                    </A>
                    <span class={styles.date} title={formatDate(props.post.post.dateCreated)} >
                        {formatPostTime(props.post.post.dateCreated)}
                    </span>
                </div>
                <div class={styles.content}>
                    <For each={props.post.post.text.split(" ")} >
                        {word => <PostFormatter str={word} />}
                    </For>
                </div>
            </div>
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
