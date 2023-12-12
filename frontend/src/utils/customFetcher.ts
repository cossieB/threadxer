import { createUser, deleteUser, token } from "~/globalState/user";

type U = Parameters<typeof fetch>[0]
type V = Parameters<typeof fetch>[1]

export async function customFetch(url: U, reqOpts?: V) {
    const isStale = (token.decoded()?.exp ?? 0) * 1000 < new Date().getTime() + 60000
    if (isStale) {
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
        
    const data = await result.json()
    if (typeof data.jwt == 'string') {
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