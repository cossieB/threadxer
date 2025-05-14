import { PostLists } from "~/components/PostLists.js"
import Page from "~/components/shared/Page.js"
import { useAllPosts, usePost } from "~/data/post.js"

export default function Home() {
    const query = useAllPosts()
    return (
        <Page title="Home">
            <PostLists query={query} />
        </Page>
    )
}

