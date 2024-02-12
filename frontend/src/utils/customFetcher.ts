import { TRPCClientError } from "@trpc/client";
import auth from "~/globalState/auth"
import { trpcClient } from "~/trpc";
import { AppRouter } from 'threadxer-server'

type U = Parameters<typeof fetch>[0]
type V = Parameters<typeof fetch>[1]

let canRefresh = true;

export async function customFetch(url: U, requestOpts?: V) {
    let isStale = Boolean(auth.user.username) && (auth.token.decoded()?.exp ?? 0) * 1000 < new Date().getTime() + 60000

    if (isStale && canRefresh) {
        canRefresh = false
        await refresh()
        canRefresh = true
    }
    return fetch(url, {
        ...requestOpts,
        headers: {
            ...(requestOpts?.headers ?? {}),
            ...auth.token.jwt && ({ Authorization: `Bearer ${auth.token.jwt}` }),
            'X-Client-Url': location.href,
        }
    })
}

async function refresh() {
    try {
        const data = await trpcClient.refresh.getAccessToken.query(undefined);
        await auth.firebaseSignin(data.fb)
        return auth.createUser(data.jwt)
    }
    catch (e: unknown) {
        if (e instanceof TRPCClientError) {
            let error = e as TRPCClientError<AppRouter['refresh']>
            console.log(error.data)
            if (error.data!.httpStatus == 401 || error.data!.httpStatus == 403) {
                return auth.deleteUser()
            }
            return {
                username: "",
                email: "",
                avatar: "",
                banner: "",
                isUnverified: false,
                userId: ""
            }
        }
    }
}