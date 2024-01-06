import { formatDate } from "~/lib/formatDate";
import styles from "~/styles/components/PostBox.module.scss"
import { formatPostTime } from "../utils/formatPostTime";
import { A, useNavigate } from "@solidjs/router";
import { Switch, Match, For, Show } from "solid-js";
import StatIcon from "./ActionIcon";
import { CommentSvg, LikeSvg, QuoteSvg, RepostSvg, ViewsSvg } from "~/svgs";
import { setComposerState } from "~/globalState/composer";
import { useLikes } from "~/data/likes";
import { PostResponse } from "~/data/post";
import { useRepost } from "~/data/repost";

export function PostBox(props: { post: PostResponse }) {
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
                        highlight={props.post.reposted}
                    />
                    <StatIcon
                        icon={<QuoteSvg />}
                        number={0}
                        color="rgb(29, 155, 240)"
                        onClick={() => {
                            setComposerState({
                                isOpen: true,
                                quotedPost: {...props.post.post, ...props.post.user,}
                            })
                        }}
                    />
                    <StatIcon
                        icon={<ViewsSvg />}
                        number={props.post.post.views}
                    />
                </div>
            </div>
            <Show when={!!props.post.quotedPost}>
                <QuoteBox quotedPost={props.post.quotedPost!} />
            </Show>
        </div>
    )
}

export function QuoteBox(props: { quotedPost: NonNullable<PostResponse['quotedPost']> }) {
    const navigate = useNavigate()
    return (
        <div class={styles.box}
            onclick={(e) => {
                navigate(`/posts/${props.quotedPost.postId}`)
                e.stopPropagation()
            }}
        >
            <div class={styles.avatar}>
                <img src={props.quotedPost.avatar} />
            </div>
            <div class={styles.div} >
                <div class={styles.header} >
                    <A href={`/users/${props.quotedPost.username}`} >
                        <span class={styles.username} > {props.quotedPost.displayName} </span> &nbsp;
                        <span class={styles.displayName} > @{props.quotedPost.username} </span>
                    </A>
                    <span class={styles.date} title={formatDate(props.quotedPost.dateCreated)} >
                        {formatPostTime(props.quotedPost.dateCreated)}
                    </span>
                </div>
                <div class={styles.content}>
                    <For each={props.quotedPost.text.split(" ")} >
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
