import { JSXElement } from "solid-js";


type P = {
    icon: JSXElement;
} & ({
    href: string;
} | {
    text: string;
});
export function BioIcons(props: P) {
    return (
        <span>
            {props.icon}
            {'text' in props ? props.text : <a href={props.href}> {props.href} </a>}
        </span>
    );
}
