import styles from "~/styles/components/PostBox.module.scss"
import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { PostResponse } from "~/data/post";
import { PostBoxButtons, PostBoxContent, PostBoxHeader } from "./PostBox.components";

export function PostBox(props: { post: PostResponse }) {
    const navigate = useNavigate()

    return (
        <>
            <Show when={!!props.post.replyingTo}>
                <QuoteBox originalPost={props.post.replyingTo!} isReply />
            </Show>
            <div class={styles.box} onclick={() => navigate(`/posts/${props.post.post.postId}`)}>

                <div class={styles.avatar}>
                    <img src={props.post.user?.avatar} />
                </div>
                <div class={styles.div} >
                    <PostBoxHeader
                        username={props.post.user.username}
                        dateCreated={props.post.post.dateCreated}
                        displayName={props.post.user.displayName}
                    />
                    <PostBoxContent text={props.post.post.text} />
                    <PostBoxButtons {...props} />
                </div>
                <Show when={!!props.post.quotedPost}>
                    <QuoteBox originalPost={props.post.quotedPost!} />
                </Show>
            </div>
        </>
    )
}

type P = {
    originalPost: NonNullable<PostResponse['quotedPost']>;
    isReply?: boolean
};

export function QuoteBox(props: P) {
    const navigate = useNavigate()
    return (
        <div 
            class={styles.box}
            classList={{[styles.reply]: !!props.isReply}}
            onclick={(e) => {
                navigate(`/posts/${props.originalPost.postId}`)
                e.stopPropagation()
            }}
        >
            <div class={styles.avatar}>
                <img src={props.originalPost.avatar} />
            </div>
            <div class={styles.div} >
                <PostBoxHeader
                    dateCreated={props.originalPost.dateCreated}
                    displayName={props.originalPost.displayName}
                    username={props.originalPost.username}
                />
                <PostBoxContent text={props.originalPost.text} />
            </div>
        </div>
    )
}
