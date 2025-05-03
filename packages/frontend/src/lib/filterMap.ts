export function filterMap<T, V>(arr: T[], predicate: (val: T) => boolean, mapFn: (val: T) => V) {
    const result: V[] = []
    for (const val of arr) {
        if (predicate(val)) {
            result.push(mapFn(val))
        }
    }
    return result
}