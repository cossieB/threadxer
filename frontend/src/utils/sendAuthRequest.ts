import { type Navigator } from '@solidjs/router';
import { QueryClient, useQueryClient } from '@tanstack/solid-query';
import { TRPCClientError } from '@trpc/client';
import type { SetStoreFunction } from 'solid-js/store';
import auth from '~/globalState/auth';
import { errors } from '~/globalState/popups';

export async function sendAuthRequest(
    mutateFn: () => Promise<{
        jwt: string;
        redirect: string | undefined;
        fb?: string;
    }>,
    setState: SetStoreFunction<{ loading: boolean; success: boolean; }>,
    navigate: Navigator,
    queryClient?: QueryClient
) {
    try {
        setState('loading', true);
        const res = await mutateFn()
        queryClient?.clear()
        setState('success', true);
        auth.createUser(res.jwt);
        res.fb && await auth.firebaseSignin(res.fb)
        const redirect =  (res.redirect as string) ?? -1; 
        navigate(redirect)

    } 
    catch (error) {
        console.error(error)
        if (error instanceof TRPCClientError) {
            return errors.addError(error.message)
        }
        errors.addError("Something Went Wrong. Please try again later")
    }
    finally {
        setState('loading', false);
    }
}
