import { type Navigator } from '@solidjs/router';
import { type JwtPayload, jwtDecode } from 'jwt-decode';
import { SetStoreFunction } from 'solid-js/store';
import { type User, setUser } from '~/globalState/user';

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
            const data = await res.json();
            const decoded = jwtDecode< {user: User} & JwtPayload >(data.jwt);
            setUser(decoded.user);
            localStorage.setItem('user', JSON.stringify(decoded.user));
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
