export function validateUrl(link: string) {
    try {
        return new URL(link);
    } catch {
        
    }
}
