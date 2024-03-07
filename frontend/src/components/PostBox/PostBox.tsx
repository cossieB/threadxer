import styles from "~/styles/components/PostBox.module.scss"
import { useNavigate } from "@solidjs/router";
import { Show, createSignal, onCleanup, onMount } from "solid-js";
import { PostBoxButtons, PostBoxContent, PostBoxHeader } from "./PostBox.components";
import { RepostSvg } from "~/svgs";
import { MediaList } from "../Media";
import { PostResponse } from "~/routes/[username]/Replies";
import { useViewPost } from "~/data/engagement";

const viewedPosts = new Set<string>()

export function PostBox(props: { post: PostResponse }) {
    let container!: HTMLDivElement
    const viewMutation = useViewPost(props.post.post.postId)

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !viewedPosts.has(props.post.post.postId)) {
                viewMutation.mutate()
                viewedPosts.add(props.post.post.postId)
            }
        });
    }, {
        threshold: 1
    });
    const navigate = useNavigate()

    onMount(() => observer.observe(container))
    onCleanup(() => observer.unobserve(container))

    return (
        <div
            ref={container}
            role="link"
        >
            <Show when={!!props.post.originalPost}>
                <QuoteBox
                    originalPost={props.post.originalPost!}
                    originalPostAuthor={props.post.originalPostAuthor!}
                    isReply
                />
            </Show>
            <div class={styles.box} onclick={() => navigate(`/posts/${props.post.post.postId}`)}>

                <div class={styles.avatar}>
                    <img src={props.post.user?.avatar}
                        onclick={(e) => {
                            console.log(e.target)
                            navigate(`/users/${props.post.user.username}`)
                            e.stopPropagation()
                        }} 
                        />
                </div>
                <div class={styles.div} >
                    <Show when={props.post.post.isRepost}>
                        <RepostSvg />
                    </Show>
                    <PostBoxHeader
                        username={props.post.user.username}
                        dateCreated={props.post.post.dateCreated}
                        displayName={props.post.user.displayName}
                    />
                    <PostBoxContent text={props.post.post.text} />
                    <Show when={!!props.post.media}>
                        <MediaList media={props.post.media!} />
                    </Show>
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

