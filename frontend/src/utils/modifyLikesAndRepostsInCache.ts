import type { InfiniteData, QueryClient } from "@tanstack/solid-query";
import { type ApiPostResponse } from "~/routes/[username]/Replies";
import { type Post } from "~/types";

export function modifyLikesAndRepostsInCache(field: 'likes' | 'reposts', queryClient: QueryClient) {
    return async function (postId: string) {
        await queryClient.cancelQueries({
            queryKey: ['posts']
        });
        const activeField = field == 'likes' ? 'liked' : 'reposted'
        let count = 0
        let fieldIsActive = false;
        
        queryClient.setQueriesData({
            queryKey: ['posts']
        }, (old: InfiniteData<ApiPostResponse> | Post | undefined) => {
            if (!old) return old;
            if ('pages' in old)
                return {
                    ...old,
                    pages: old?.pages.map(page => ({
                        ...page,
                        posts: page.posts.map(post => {
                            if (post.post.postId != postId)
                                return post

                            const newPost: Post = JSON.parse(JSON.stringify(post));
                            fieldIsActive = post[activeField] ?? false
                            count = post[field]
                            const incr = post[activeField] ? -1 : 1;
                            newPost[activeField] = !post[activeField];
                            newPost[field] += incr;
                            return newPost;
                        })
                    }))
                }
            return {
                ...old,
                [activeField]: !old[activeField],
                [field]: old[field] + (old[activeField] ? -1 : 1)
            }
        });
        return { count, fieldIsActive, field, activeField };
    };
}

export function rollbackLikesAndReposts(
    old: InfiniteData<ApiPostResponse> | Post | undefined,
    variables: string,
    context?: {
        count: number;
        fieldIsActive: boolean;
        field: "reposts" | "likes";
        activeField: string;
    },
) {
    if (!old || !context) return old;
    const activeField = context.field == 'likes' ? 'liked' : 'reposted'
    if ('pages' in old)
        return {
            ...old,
            pages: old?.pages.map(page => ({
                ...page,
                posts: page.posts.map(post => {
                    if (post.post.postId != variables)
                        return post

                    const newPost: Post = JSON.parse(JSON.stringify(post));
                    newPost[activeField] = !post[activeField];
                    newPost[context.field] = context.count
                    return newPost;
                })
            }))
        }
    return {
        ...old,
        [activeField]: !old[activeField],
        [context.field]: context.count
    }
}