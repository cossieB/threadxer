import { QueryClient } from "@tanstack/solid-query";
import { PostResponse } from "~/routes/[username]/Replies";;

export function modifyLikesAndRepostsInCache(field: 'likes' | 'reposts', queryClient: QueryClient) {
    return async function (postId: string) {
        await queryClient.cancelQueries({
            queryKey: ['posts']
        });

        const posts = queryClient.getQueryData<PostResponse[]>(['posts']);

        queryClient.setQueriesData({
            queryKey: ['posts']
        }, (old: PostResponse[] | PostResponse | undefined) => {
            if (Array.isArray(old)) {
                const post = old.find(x => x.post.postId == postId);
                if (!post) {
                    console.log(postId);
                    return old;
                }
                const newPost: PostResponse = JSON.parse(JSON.stringify(post));
                const activeField = field == 'likes' ? 'liked' : 'reposted'
                const incr = post[activeField] ? -1 : 1;
                newPost[activeField] = !post[activeField];
                newPost[field] += incr;
                return old.map(x => x.post.postId === postId ? newPost : x);
            }
            else if (old && old.post.postId === postId) {
                const newPost: PostResponse = JSON.parse(JSON.stringify(old));
                const activeField = field == 'likes' ? 'liked' : 'reposted'
                const incr = old[activeField] ? -1 : 1;
                newPost[activeField] = !old[activeField];
                newPost[field] += incr;
                return newPost;
            }
        });
        return posts;
    };
}

