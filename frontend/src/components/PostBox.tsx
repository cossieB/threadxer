import { unwrap } from "solid-js/store";
import { formatDate } from "~/lib/formatDate";
import { PostResponse } from "~/models/post";
import styles from "~/styles/components/PostBox.module.scss"
import { formatPostTime } from "../utils/formatPostTime";
import { A, useNavigate } from "@solidjs/router";
import { Switch, Match, For } from "solid-js";
import ActionIcon from "./ActionIcon";
import { CommentSvg, LikeSvg, QuoteSvg, RepostSvg, ViewsSvg } from "~/svgs";

export function PostBox(props: { post: PostResponse }) {
    const navigate = useNavigate()
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
                    <ActionIcon icon={<CommentSvg />} text={0} color="rgb(29, 155, 240)" />
                    <ActionIcon icon={<LikeSvg />} text={0} color="rgb(249, 24, 128)" />
                    <ActionIcon icon={<QuoteSvg />} text={0} color="rgb(0,186,124)" />
                    <ActionIcon icon={<RepostSvg />} text={0} />
                    <ActionIcon icon={<ViewsSvg />} text={props.post.post.views} />
                </div>
            </div>
        </div>
    )
}

function PostFormatter(props: { str: string }) {
    return (
        <Switch fallback={props.str + " "}>
            <Match when={/(?:\s|^)(#\w+)(\s|$)/.test(props.str)}>
                <A href={`/search/?hashtag=${props.str}`} class={styles.special}>{props.str}</A>{" "}
            </Match>
            <Match when={/(?:\s|^)(@\w+)(\s|$)/.test(props.str)}>
                <A href={`/users/${props.str.slice(1)}`} class={styles.special}>{props.str}</A>{" "}
            </Match>
        </Switch>
    )
}


