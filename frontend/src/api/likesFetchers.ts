import auth from "~/globalState/auth";
import { errors } from "~/globalState/popups";
import { customFetch } from "~/utils/customFetcher";
import { handleApiError } from "./handleApiError";


export async function likeOrUnlikePost(postId: string) {
    if (!auth.user.username) {
        errors.addError("Please login to like");
        throw new Error("Please login to like");
    }
    const res = await customFetch(`/api/likes/${postId}`, {
        method: "POST",
    });
    if (res.status === 201) {
        return 1;
    }
    if (res.status === 200) {
        return -1;
    }
    const err = await handleApiError(res); console.log(err);
    errors.addError(err.message);
    throw err;
}
