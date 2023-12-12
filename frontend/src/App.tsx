import { Route, Routes, useLocation } from '@solidjs/router';
import Home from './routes/Home';
import Navbar from './components/Navbar';
import { Show, createEffect, createSignal, onMount } from 'solid-js';
import { SignUp } from './routes/auth/SignUp';
import { Login } from './routes/auth/Login';
import NotFound from './components/404';
import { user } from './globalState/user';
import { PostComposer } from './components/PostComposer';
import VerifyEmail from './routes/auth/Verify';
import { Popup } from './components/shared/Popup';
import { refresh } from './utils/customFetcher';

export const [composerOpen, setComposerOpen] = createSignal(false)

function App() {

    const location = useLocation();

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
            <Show when={!user.isUnverified}>
                <Navbar />
            </Show>
            <Show when={composerOpen()}>
                <PostComposer />
            </Show>
            <Popup
                close={() => history.replaceState(undefined, "")}
                text={location.state!.message}
                when={location.state?.message}
            />
            <Routes>
                <Route path="/" component={Home} />
                <Route path="/auth/signup" component={SignUp} />
                <Route path="/auth/login" component={Login} />
                <Route path="/auth/verify" component={VerifyEmail} />
                <Route path="/create" component={PostComposer} />
                <Route path="*" component={NotFound} />
            </Routes>
        </>
    );
};

export default App;
