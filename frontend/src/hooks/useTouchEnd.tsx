type Functions = {
    onSwipeUp?: () => void
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeDown?: () => void
}

export function useTouch(funcs: Functions = {}) {
    let x1 = 0;
    let y1 = 0

    function handleTouchStart(e: TouchEvent) {
        x1 = e.touches.item(0)!.clientX;
        y1 = e.touches.item(0)!.clientY;
    }
    function handleTouchEnd(e: TouchEvent) {
        const item = e.changedTouches.item(0); console.log(x1, y1)
        if (!item) return;
        const { clientX: x2, clientY: y2 } = item
        const m = (y1 - y2) / (x2 - x1) // High school gradient formula. clientY starts from the top. That's why I swapped y1 and y2 
        const arctan = Math.atan(m)
        const angle = arctan * 180 / Math.PI;
        if (angle > -30 && angle < 30) {
            if (x2 > x1) {
                funcs.onSwipeRight?.()
            }
            else {
                funcs.onSwipeLeft?.()
            }
        }
        else if ((angle > 60 && angle <= 90) || (angle < -60 && angle > -90)) {
            if (y2 < y1) {
                funcs.onSwipeUp?.()
            }
            else {
                funcs.onSwipeDown?.()
            }
        }
    }
    return {handleTouchEnd, handleTouchStart}
}