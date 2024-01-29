import { type Navigator } from '@solidjs/router';
import { QueryClient, useQueryClient } from '@tanstack/solid-query';
import { SetStoreFunction } from 'solid-js/store';
import auth from '~/globalState/auth';

export async function sendAuthRequest(
    url: string,
    setState: SetStoreFunction<{ loading: boolean; success: boolean; error: string | null; }>,
    userState: {},
    navigate: Navigator,
    queryClient?: QueryClient
) {
    try {
        setState('loading', true);
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userState)
        });
        if (res.ok) {
            queryClient?.clear()
            setState('success', true);
            const data = await res.json(); 
            const redirect =  (data.redirect as string) ?? -1; 
            navigate(redirect)
            data.fb && await auth.firebaseSignin(data.fb)
            auth.createUser(data.jwt);
        }
        else if (res.headers.get('Content-Type')?.includes('application/json')) {
            const data = await res.json();
            setState('error', data.error);
        }
        else {
            setState('error', "Something Went Wrong. Please try again later");
        }
    } 
    catch (error) {
        console.log(error)
    }
    finally {
        setState('loading', false);
    }
}
