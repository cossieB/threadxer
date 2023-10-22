import { SetStoreFunction } from 'solid-js/store';
import { setUser } from '~/user';

export async function sendAuthRequest(
    url: string,
    setState: SetStoreFunction<{ loading: boolean; success: boolean; error: string | null; }>,
    userState: {}
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
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
        }
        if (res.status === 400) {
            const data = await res.json();
            setState('error', data.error);
        }
    } catch (error) {
        console.log(error);
    }
    finally {
        setState('loading', false);
    }
}
