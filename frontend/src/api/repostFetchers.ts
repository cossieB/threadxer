import auth from "~/globalState/auth";
import { errors } from "~/globalState/popups";
import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";


export async function repostOrUnrepost(postId: string) {
    if (!auth.user.username) {
        errors.addError("Please login to repost");
        throw new Error("Please login to repost");
    }
    const res = await customFetch(`/api/reposts/${postId}`, {
        method: "POST",
    });
    if (res.status === 201) {
        return 1;
    }
    if (res.status === 200) {
        return -1;
    }
    throw await handleApiError(res);
}
