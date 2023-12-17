import { type Navigator } from '@solidjs/router';
import { SetStoreFunction } from 'solid-js/store';
import { createUser, firebaseSignin } from '~/globalState/user';

export async function sendAuthRequest(
    url: string,
    setState: SetStoreFunction<{ loading: boolean; success: boolean; error: string | null; }>,
    userState: {},
    navigate: Navigator
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
            setState('success', true);
            const data = await res.json(); 
            createUser(data.jwt);
            data.fb && await firebaseSignin(data.fb)
            navigate(data.redirect)
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
