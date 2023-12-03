import { Route, Routes } from '@solidjs/router';
import Home from './routes/Home';
import Navbar from './components/Navbar';
import { Show, createEffect, createSignal, onMount } from 'solid-js';
import { SignUp } from './components/auth/SignUp';
import { Login } from './components/auth/Login';
import NotFound from './components/404';
import { setUser } from './globalState/user';
import { PostComposer } from './components/PostComposer';

export const [composerOpen, setComposerOpen] = createSignal(false)

function App() {

    onMount(() => {
        (async function () {
            const res = await fetch('/api/auth/refresh')
            if (res.ok) {
                const data = await res.json();
                setUser(data)
            }
            else {
                setUser({
                    avatar: "",
                    banner: "",
                    email: "",
                    username: ""
                })
            }
        })()
    })
    createEffect(() => {
        if (composerOpen())
            document.body.classList.add("modalOpen")
        else
            document.body.classList.remove("modalOpen")
    })
    return (
        <>
            <Navbar />
            <Show when={composerOpen()}>
                <PostComposer />
            </Show>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth/signup" element={<SignUp />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/create" element={<PostComposer />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

export default App;
