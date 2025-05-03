export function splitArray<T>(arr: T[], itemsPerInnerArray = 5) {
    let localArray: T[][] = []

    for (let i = 0; i < arr.length; i += itemsPerInnerArray) {
        localArray.push(arr.slice(i, i + itemsPerInnerArray))
    }
    return localArray
}