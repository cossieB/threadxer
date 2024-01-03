import Navbar from './components/Navbar';
import { JSXElement, Show, createEffect, createSignal, onMount } from 'solid-js';
import { user } from './globalState/user';
import { PostComposer } from './components/PostComposer';
import { refresh } from './utils/customFetcher';
import { createStore } from 'solid-js/store';
import { composerState } from './globalState/composer';

function App(props: { children?: JSXElement }) {

    onMount(() => {
        // refresh()
    })
    createEffect(() => {
        if (composerState.isOpen)
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
            <Show when={composerState.isOpen}>
                <PostComposer />
            </Show>
        </>
    );
};

export default App;
