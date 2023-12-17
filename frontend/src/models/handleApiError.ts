export async function handleApiError(res: Response) {
    if (!res.ok) {
        if (res.headers.get('Content-Type')?.includes('application/json')) {
            const data = await res.json();
            throw new Error(data.error);
        }
        else {
            throw new Error("Something went wrong. Please try again later.");
        }
    }
}
