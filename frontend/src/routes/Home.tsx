import { PostLists } from "~/components/PostLists"
import Page from "~/components/shared/Page"
import { usePost } from "~/data/post"

export default function Home() {
    const {allPostsQuery} = usePost()
    return (
        <Page title="Home">
            <PostLists query={allPostsQuery} />
        </Page>
    )
}

