export function formatPostTime(postDate: string | Date) {
    const date = new Date(postDate);
    const now = new Date;
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60)
        return `${Math.round(diff)}s ago`;
    if (diff < 3600) {
        const minutes = Math.round(diff / 60);
        return `${minutes} min ago`;
    }
    if (diff < 86400) {
        const hours = Math.round(diff / 3600);
        return `${hours} hrs ago`;
    }
    if (diff < 3600 * 24 * 365.25)
        return date.toLocaleDateString(['en-za'], {
            day: 'numeric',
            month: 'short'
        });
    return date.toLocaleDateString(['en-za'], {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}
