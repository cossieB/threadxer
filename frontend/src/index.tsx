/* @refresh reload */
import { render } from 'solid-js/web'

import './index.scss'
import App from './App'
import { Router } from '@solidjs/router'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';

const root = document.getElementById('root');
const queryClient = new QueryClient

render(() =>
    <QueryClientProvider client={queryClient}>
        <Router>
            <App />
        </Router>
    </QueryClientProvider>
    , root!)
