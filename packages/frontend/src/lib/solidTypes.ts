export type ClickEvent<T extends Element = Element> = {
    currentTarget: T,
    target: Element
}

export type ChangeEvent<T extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = {
    currentTarget: T,
    target: T
}