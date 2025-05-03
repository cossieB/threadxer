/**
 * 
 * @param input String you want to turn to title case. Assumes space-separated words or camel-cased string.
 * @returns 
 */
export default function(input: string) {
    const arr = input.split(" ");
    const ignoreList = ["of", "the", "a", "an"]
    let titleCased = ""
    for (let i = 0; i < arr.length; i++) {
        let word = arr[i]
        word = word.replace(/([a-z])([A-Z])/g, '$1 $2')
        if (i > 0 && ignoreList.includes(word)) {
            titleCased += word + " ";
            continue;
        }
        const modifiedWord = word.slice(0,1).toUpperCase() + word.slice(1)
        titleCased += modifiedWord + " "
    }
    return titleCased.trimEnd()
}