import auth from "~/globalState/auth"

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
            ...auth.token.jwt && ({ Authorization: `Bearer ${auth.token.jwt}` })
        }
    })
}

async function refresh() {
    const result = await fetch('/api/auth/refresh')
    if (result.status == 401 || result.status == 403) {
        return auth.deleteUser()
    }
    if (result.ok) {
        const data = await result.json()
        await auth.firebaseSignin(data.fb)
        return auth.createUser(data.jwt)
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