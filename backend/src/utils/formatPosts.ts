import type { getPosts } from "../queries/getPosts"

export function formatPosts(post: Awaited<ReturnType<typeof getPosts>>[number]) {
    const { originalPost, originalPostAuthor, quoteAuthor, quotePost, ...x } = post
    return {
        ...x,
        ...originalPost?.postId && { originalPost, originalPostAuthor },
        ...quotePost?.postId && { quotePost, quoteAuthor },
    }
}