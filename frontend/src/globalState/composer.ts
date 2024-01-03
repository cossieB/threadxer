import { createStore } from "solid-js/store";
import { PostResponse } from "~/models/post";

type Post = {
    post: {
        text: string;
        userId: string;
        postId: string;
        dateCreated: Date;
        views: number;
        replyTo: string | null;
        didReply: boolean;
        quotedPost: string | null;
        didQuote: boolean;
        likes: number,
        reposts: number
    };
    user: {
        userId: string;
        username: string;
        email: string;
        avatar: string;
        banner: string;
        displayName: string
    }
    liked?: boolean,
    reposted?: boolean
}

export const [composerState, setComposerState] = createStore({
    isOpen: false,
    quotedPost: null as PostResponse | null
})