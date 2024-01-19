import auth from "~/globalState/auth"

type U = Parameters<typeof fetch>[0]
type V = Parameters<typeof fetch>[1]

export async function customFetch(url: U, reqOpts?: V) {
    let isStale = (auth.token.decoded()?.exp ?? 0 ) * 1000 < new Date().getTime() + 60000 
    
    // Don't attempt to get the refresh token if there is no user logged in.
    if (!auth.user.username) {
        isStale = false
    }
        
    if (isStale) {
        await refresh()
    }
    return fetch(url, {
        ...reqOpts,
        headers: {
            ...(reqOpts?.headers ?? {}),
            ...auth.token.jwt && ({ Authorization: `Bearer ${auth.token.jwt}` })
        }
    })
}

export async function refresh() {
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