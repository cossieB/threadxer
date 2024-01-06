import { createStore } from "solid-js/store";
import { PostResponse } from "~/data/post";

export const [composerState, setComposerState] = createStore({
    isOpen: false,
    quotedPost: undefined as PostResponse['quotedPost'],
    replyTo: undefined as PostResponse['replyingTo'],
    close: () => setComposerState({
        isOpen: false, 
        quotedPost: undefined,
        replyTo: undefined
    })
})