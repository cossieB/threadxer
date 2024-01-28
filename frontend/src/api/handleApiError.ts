import { errors } from "~/globalState/popups";

export async function handleApiError(res: Response) {
    let error = ""
    if (res.headers.get('Content-Type')?.includes('application/json')) {
        const data = await res.json();
        error = data.error
    }
    else {
        error = "Something went wrong. Please try again later."
    }
    errors.addError(error);
    throw new Error(error)
}
