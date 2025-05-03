export function setDifference<T>(set1: Set<T>, set2: Set<T>) {
    const output = new Set<T>()
    set1.forEach(a => {
        if (!set2.has(a)) 
            output.add(a)
    })
    return output
}