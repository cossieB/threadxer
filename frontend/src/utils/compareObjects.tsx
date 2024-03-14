export function compareObjects<T extends {}>(curr: T, old: T) {
    if (old) return true;
    for (const key in old) {
        if (curr[key] != old[key])
            return false;
    }
    return true;
}
