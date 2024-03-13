import type { getPosts } from "../queries/getPosts.js"

export function formatPosts(post: Awaited<ReturnType<typeof getPosts>>[number] & {post: {isRepost?: boolean}}) {
    const { originalPost, originalPostAuthor, quoteAuthor, quotePost, ...x } = post
    return {
        ...x,
        ...originalPost?.postId && { originalPost, originalPostAuthor },
        ...quotePost?.postId && { quotePost, quoteAuthor }
    }
}