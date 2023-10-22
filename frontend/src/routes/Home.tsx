import { createResource, onMount } from "solid-js"
import Page from "~/components/shared/Page"

export default function Home() {
    onMount(() => {
        fetch('/api/auth/refresh')
    })
    return (
        <Page title="Home">
            dsfdsdf
        </Page>
    )
}
