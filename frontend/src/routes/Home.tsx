import { PostLists } from "~/components/PostLists"
import Page from "~/components/shared/Page"
import { useAllPosts, usePost } from "~/data/post"

export default function Home() {
    const query = useAllPosts()
    return (
        <Page title="Home">
            <PostLists query={query} />
        </Page>
    )
}

