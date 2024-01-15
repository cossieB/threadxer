import { SetStoreFunction } from "solid-js/store";
import { Navigator } from "@solidjs/router";
import auth from "~/globalState/auth";
import { customFetch } from "~/utils/customFetcher";
import { errors } from "~/globalState/popups";


export async function handleSubmit(
    code: string,
    setState: SetStoreFunction<{
        submitting: boolean;
        finished: boolean;
        isResending: boolean;
        resendSuccessful: boolean;
        error: string;
    }>,
    navigate: Navigator
    ) {
    const res = await customFetch('/api/auth/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
    });
    if (!res.ok) {
        const data = await res.json()
        return setState('error', data?.error ?? "")
    }
    const data = await res.json();
    auth.createUser(data.jwt)
    data.fb && await auth.firebaseSignin(data.fb)
    navigate("/profile")
}

export async function handleResend(setState: SetStoreFunction<{
    submitting: boolean;
    finished: boolean;
    isResending: boolean;
    resendSuccessful: boolean;
    error: string;
}>) {
    if (!auth.user.username) return errors.addError("Please login to resend your verification email")
    setState('isResending', true);

    try {
        const response = await customFetch('/api/auth/verify')
        if (!response.ok) {
            // TODO handle error
            return
        }
        setState('resendSuccessful', true)
    }
    catch (error) {

    }
    finally {
        setState('isResending', false)
    }
}