import { createStore } from "solid-js/store";
import { PostResponse } from "~/data/post";

export const [composerState, setComposerState] = createStore({
    isOpen: false,
    quotedPost: undefined as PostResponse | undefined,
    replyTo: undefined as PostResponse | undefined,
})