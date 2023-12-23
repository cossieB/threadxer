/* @refresh reload */
import { render } from 'solid-js/web'

import './index.scss'
import App from './App'
import { Route, Router } from '@solidjs/router'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import NotFound from './components/404';
import { PostComposer } from './components/PostComposer';
import Home from './routes/Home';
import ProfilePage from './routes/ProfilePage';
import { Login } from './routes/auth/Login';
import { SignUp } from './routes/auth/SignUp';
import VerifyEmail from './routes/auth/Verify';
import UserPage from './routes/[username]';

const root = document.getElementById('root');
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            retry(failureCount, error) {
                return failureCount < 3 && !error.message.toLowerCase().includes("unauthorized")
            },
        },
    }
})

render(() =>
    <QueryClientProvider client={queryClient}>
        <Router root={App}>
            <Route path="/" component={Home} />
            <Route path="/auth/signup" component={SignUp} />
            <Route path="/auth/login" component={Login} />
            <Route path="/auth/verify" component={VerifyEmail} />
            <Route path="/create" component={PostComposer} />
            <Route path="*" component={NotFound} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/users/:username" >
                <Route path={["/", "replies", "media"]} component={UserPage}  />
            </Route>
        </Router>
    </QueryClientProvider>
    , root!)
