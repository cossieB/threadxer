import { SetStoreFunction } from "solid-js/store";
import { Navigator } from "@solidjs/router";
import auth from "~/globalState/auth";
import { errors } from "~/globalState/popups";
import { trpcClient } from "~/trpc";
import { TRPCClientError } from "@trpc/client";

export async function handleSubmit(
    code: string,
    navigate: Navigator
) {
    try {
        const data = await trpcClient.verify.verifyUser.mutate(code)
        auth.createUser(data.jwt)
        data.fb && await auth.firebaseSignin(data.fb)
        navigate("/profile")
    }
    catch (error) {
        if (error instanceof TRPCClientError)
            return errors.addError(error.message)
        errors.addError("Something went wrong. Please try again later.")
    }
}

export async function handleResend(
    setState: SetStoreFunction<{
        submitting: boolean;
        finished: boolean;
        isResending: boolean;
        resendSuccessful: boolean;
        error: string;
    }>
) {
    if (!auth.user.username) 
        return errors.addError("Please login to resend your verification email")
    try {
        setState('isResending', true);
        await trpcClient.verify.resendToken.mutate()
        setState('resendSuccessful', true)
    }
    catch (error) {
        if (error instanceof TRPCClientError)
            return errors.addError(error.message)
        errors.addError("Something went wrong. Please try again later.")
    }
    finally {
        setState('isResending', false)
    }
}