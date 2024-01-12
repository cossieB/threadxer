export async function handleApiError(res: Response) {console.log("HERE")
    if (res.headers.get('Content-Type')?.includes('application/json')) {
        const data = await res.json();
        return new Error(data.error);
    }
    else {
        return new Error("Something went wrong. Please try again later.");
    }
}
