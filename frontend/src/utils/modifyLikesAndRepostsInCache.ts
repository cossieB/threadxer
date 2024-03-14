import type { InfiniteData, QueryClient } from "@tanstack/solid-query";
import { type ApiPostResponse } from "~/routes/[username]/Replies";
import { type Post } from "~/types";

export function modifyLikesAndRepostsInCache(field: 'likes' | 'reposts', queryClient: QueryClient) {
    return  function (data: -1 | 1, postId: string) {

        const activeField = field == 'likes' ? 'liked' : 'reposted'
        
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
                            newPost[activeField] = data == 1;
                            newPost[field] += data;
                            return newPost;
                        })
                    }))
                }
            return {
                ...old,
                [activeField]: data == 1,
                [field]: old[field] + data
            }
        });
    };
}