import { createStore } from "solid-js/store";
import { PostResponse } from "~/api/postFetchers";

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