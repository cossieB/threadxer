import styles from "~/styles/components/PostBox.module.scss"
import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { PostResponse } from "~/api/postFetchers";
import { PostBoxButtons, PostBoxContent, PostBoxHeader } from "./PostBox.components";
import { RepostSvg } from "~/svgs";

export function PostBox(props: { post: PostResponse }) {
    const navigate = useNavigate()

    return (
        <div>
            <Show when={!!props.post.originalPost}>
                <QuoteBox
                    originalPost={props.post.originalPost!}
                    originalPostAuthor={props.post.originalPostAuthor!}
                    isReply
                />
            </Show>
            <div class={styles.box} onclick={() => navigate(`/posts/${props.post.post.postId}`)}>

                <div
                    class={styles.avatar}
                    onclick={(e) => {
                        console.log(e.target)
                        navigate(`/users/${props.post.user.username}`)
                        e.stopPropagation()
                    }}
                >
                    <img src={props.post.user?.avatar} />
                </div>
                <div class={styles.div} >
                    <Show when={props.post.isRepost}>
                        <RepostSvg />
                    </Show>
                    <PostBoxHeader
                        username={props.post.user.username}
                        dateCreated={props.post.post.dateCreated}
                        displayName={props.post.user.displayName}
                    />
                    <PostBoxContent text={props.post.post.text} />
                    <PostBoxButtons {...props} />
                </div>
                <Show when={!!props.post.quotePost}>
                    <QuoteBox
                        originalPost={props.post.quotePost!}
                        originalPostAuthor={props.post.quoteAuthor!}
                    />
                </Show>
            </div>
        </div>
    )
}

type P = {
    originalPost: NonNullable<PostResponse['quotePost']>;
    originalPostAuthor: NonNullable<PostResponse['quoteAuthor']>
    isReply?: boolean
};

export function QuoteBox(props: P) {
    const navigate = useNavigate()
    return (
        <div
            class={styles.box}
            classList={{ [styles.reply]: !!props.isReply }}
            onclick={(e) => {
                navigate(`/posts/${props.originalPost.postId}`)
                e.stopPropagation()
            }}
        >
            <div
                class={styles.avatar}
                onclick={(e) => {
                    navigate(`/users/${props.originalPostAuthor.username}`)
                    e.stopPropagation()
                }}
            >
                <img src={props.originalPostAuthor.avatar} />
            </div>
            <div class={styles.div} >
                <PostBoxHeader
                    dateCreated={props.originalPost.dateCreated}
                    displayName={props.originalPostAuthor.displayName}
                    username={props.originalPostAuthor.username}
                />
                <PostBoxContent text={props.originalPost.text} />
            </div>
        </div>
    )
}

