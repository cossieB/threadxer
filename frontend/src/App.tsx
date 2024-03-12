import Navbar from './components/Navbar';
import { type JSXElement, Show, createEffect } from 'solid-js';
import auth from './globalState/auth';
import { PostComposer } from './components/PostComposer';
import { composerState } from './globalState/composer';
import { Toast } from './components/ErrorPopups';

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
            <div class="sidepanel" />
            <Show when={composerState.isOpen}>
                <PostComposer />
            </Show>
            <Toast />
        </>
    );
};

export default App;