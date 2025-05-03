export default function<T>(arr: T[]) {
    let localCopy = [...arr]
    let shuffledArray: T[] = [];

    while (localCopy.length > 0) {
        let index = Math.floor(Math.random() * localCopy.length);
        let elems = localCopy.splice(index, 1);
        shuffledArray = shuffledArray.concat(elems)
    }
    return shuffledArray
}