import { createUser, deleteUser, firebaseSignin, setToken, token } from "~/globalState/user";

type U = Parameters<typeof fetch>[0]
type V = Parameters<typeof fetch>[1]

export async function customFetch(url: U, reqOpts?: V, shouldRefresh = true) {
    const isStale = (token.decoded()?.exp ?? 0) * 1000 < new Date().getTime() + 60000
    if (isStale && shouldRefresh) {
        await refresh()
    }
    return fetch(url, {
        ...reqOpts,
        headers: {
            ...(reqOpts?.headers ?? {}),
            ...token.jwt && ({ Authorization: `Bearer ${token.jwt}` })
        }
    })
}

export async function refresh() {
    const result = await fetch('/api/auth/refresh')
    if (result.status == 401 || result.status == 403) {
        return deleteUser()
        
    }
    if (result.ok) {
    const data = await result.json()
        await firebaseSignin(data.fb)
        return createUser(data.jwt)         
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