import { type JwtPayload, jwtDecode } from 'jwt-decode';
import { SetStoreFunction } from 'solid-js/store';
import { User, setUser } from '~/user';

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
            const decoded = jwtDecode< {user: User} & JwtPayload >(data.jwt);
            setUser(decoded.user);
            localStorage.setItem('user', JSON.stringify(decoded.user));
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
