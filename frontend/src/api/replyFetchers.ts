import { customFetch } from "~/utils/customFetcher";
import { PostResponse } from "~/routes/[username]/Replies";;
import { handleApiError } from "./handleApiError";

//fetchers
export async function getReplies(username: string) {
    const res = await customFetch(`/api/users/${username}/replies`.toLowerCase());
    if (res.ok) {
        return await res.json() as PostResponse[];
    }
    throw await handleApiError(res);
}
