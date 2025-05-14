import { createStore } from "solid-js/store";
import type { PostResponse } from "~/types.js";

export const [composerState, setComposerState] = createStore({
    isOpen: false,
    quoting: undefined as {
        post: PostResponse['quotePost']
        author: PostResponse['quoteAuthor']
    } | undefined,
    replying: undefined as {
        post: PostResponse['originalPost']
        author: PostResponse['originalPostAuthor']
    } | undefined,
    close: () => setComposerState({
        isOpen: false, 
        quoting: undefined,
        replying: undefined
    })
})