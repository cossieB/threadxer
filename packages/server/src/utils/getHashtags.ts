export function getHashtags(text: string) {
    const rgx = /(?<=\s|^)(#\w+)(?=\s|$)/g;
    const matches = text.matchAll(rgx);
    const uniqueTags = new Set<string>();
    for (const match of matches) {
        uniqueTags.add(match[0].toLowerCase());
    }
    const uniques = Array.from(uniqueTags);
    return uniques;
}