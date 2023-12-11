import { type Navigator } from '@solidjs/router';
import { SetStoreFunction } from 'solid-js/store';
import { createUser } from '~/globalState/user';

export async function sendAuthRequest(
    url: string,
    setState: SetStoreFunction<{ loading: boolean; success: boolean; error: string | null; }>,
    userState: {},
    navigate: Navigator
): Promise<false | [true, string]> {
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
            const data = await res.json(); console.log(data)
            createUser(data.jwt)
            navigate(data.redirect)
        }
        if (res.status === 400) {
            const data = await res.json();
            setState('error', data.error);
            return false
        }
        else {
            setState('error', "Something Went Wrong. Please try again later");
            return false
        }
    } 
    catch (error) {
        console.log(error);
        return false
    }
    finally {
        setState('loading', false);
    }
}
