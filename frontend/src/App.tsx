import { Route, Routes } from '@solidjs/router';
import Home from './routes/Home';
import CreatePost from './routes/CreatePost';
import Navbar from './components/Navbar';
import { createEffect } from 'solid-js';
import { SignUp } from './components/auth/SignUp';
import { Login } from './components/auth/Login';
import NotFound from './components/404';

function App() {
    createEffect(() => {
        
    })
    return (
        <>
            <Navbar />
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
