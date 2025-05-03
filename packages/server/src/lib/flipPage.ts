/**
 * Calculates the next page.
 * @param current The current page. Must be an integer
 * @param by The amount to increment or decrement the current page by. Must be an integer
 * @param max The highest possible page. Must be an integer
 * @param wrapAround Whether to wrap around if the calculated page is larger than the max
 * @param min The lowest possible page. Must be an integer
 * @returns the value of the next page
 */
export function flipPage(current: number, by: number, max: number, wrapAround = false, min = 0) {
    if (wrapAround) {
        return Math.max((current + by) % max, min);
    }
    else {
        return Math.min(max, Math.max(min, current + by));
    }
}
