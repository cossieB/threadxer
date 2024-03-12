import { redis } from "../redis";

export async function filterViews(posts: string[], ip: string) {
    const promises = posts.map(x => redis.get(`views:${ip}:${x}`));
    const z = await Promise.all(promises);
    const arr: string[] = [];
    z.forEach((val, i) => {
        if (!val) {
            arr.push(posts[i]);
        }
    });
    return arr;
}
