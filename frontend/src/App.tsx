import Navbar from './components/Navbar';
import { JSXElement, Show, createEffect, createSignal, onMount } from 'solid-js';
import { user } from './globalState/user';
import { PostComposer } from './components/PostComposer';
import { refresh } from './utils/customFetcher';

export const [composerOpen, setComposerOpen] = createSignal(false)

function App(props: { children?: JSXElement }) {

    onMount(() => {
        refresh()
    })
    createEffect(() => {
        if (composerOpen())
            document.body.classList.add("modalOpen")
        else
            document.body.classList.remove("modalOpen")
    })
    return (
        <>
            <div class="layout">
                <Show when={!user.isUnverified}>
                    <Navbar />
                </Show>
                {props.children}
                <div class="sidepanel"></div>
            </div>
            <Show when={composerOpen()}>
                <PostComposer />
            </Show>
        </>
    );
};

export default App;
