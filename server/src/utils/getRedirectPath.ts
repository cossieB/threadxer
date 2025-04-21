import assert from "node:assert"

export function getRedirectPath(header: unknown) {
    let redirect: string | undefined
    try {
        assert(typeof header === "string")
        const url = new URL(header)
        if (url.searchParams.get('redirect'))
            redirect = url.searchParams.get('redirect')!
    } catch (_) { }
    return redirect
}