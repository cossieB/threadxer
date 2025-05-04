import { PostLists } from "#client/components/PostLists.js"
import Page from "#client/components/shared/Page.js"
import { useAllPosts, usePost } from "#client/data/post.js"

export default function Home() {
    const query = useAllPosts()
    return (
        <Page title="Home">
            <PostLists query={query} />
        </Page>
    )
}

