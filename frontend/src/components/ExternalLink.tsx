import type { JSXElement } from "solid-js"

type Props = {
    href: string
    title?: string
    children: JSXElement
}

export default function ExternalLink({ href, title, children }: Props) {
    return (
        <a href={href} target="_blank" rel="noreferrer" title={title}>
            {children}
        </a>
    )
}