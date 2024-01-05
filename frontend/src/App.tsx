import Navbar from './components/Navbar';
import { JSXElement, Show, createEffect, onMount } from 'solid-js';
import auth from './globalState/auth';
import { PostComposer } from './components/PostComposer';
import { composerState } from './globalState/composer';

function App(props: { children?: JSXElement }) {

    createEffect(() => {
        if (composerState.isOpen)
            document.body.classList.add("modalOpen")
        else
            document.body.classList.remove("modalOpen")
    })
    return (
        <>
            <Show when={!auth.user.isUnverified}>
                <Navbar />
            </Show>
            {props.children}
            <div class="sidepanel"></div>
            <Show when={composerState.isOpen}>
                <PostComposer />
            </Show>
        </>
    );
};

export default App;
