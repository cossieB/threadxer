import { Route, Routes } from '@solidjs/router';
import Home from './routes/Home';
import CreatePost from './routes/CreatePost';
import Navbar from './components/Navbar';
import { createEffect, onMount } from 'solid-js';
import { SignUp } from './components/auth/SignUp';
import { Login } from './components/auth/Login';
import NotFound from './components/404';
import { setUser } from './user';

function App() {
    let ref!: HTMLDivElement
    onMount(() => {
        (async function () {
            const res = await fetch('/api/auth/refresh')
            if (res.ok) {
                const data = await res.json();
                setUser(data)
            }
            else {
                const user = {
                    avatar: "",
                    banner: "",
                    email: "",
                    username: ""
                }
                setUser({
                    avatar: "",
                    banner: "",
                    email: "",
                    username: ""
                })
            }
        })()
    })
    return (
        <>
            <Navbar />
            <div class='modal' />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth/signup" element={<SignUp />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

export default App;
