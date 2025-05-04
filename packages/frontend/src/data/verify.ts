import { SetStoreFunction } from "solid-js/store";
import { Navigator } from "@solidjs/router";
import auth from "#client/globalState/auth.js";
import { errors } from "#client/globalState/popups.js";
import { trpcClient } from "#client/trpc.js";
import { TRPCClientError } from "@trpc/client";

export async function handleSubmit(
    code: string,
    navigate: Navigator
) {
    try {
        const data = await trpcClient.verify.verifyUser.mutate(code)
        auth.createUser(data.jwt)
        data.firebaseToken && await auth.firebaseSignin(data.firebaseToken)
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