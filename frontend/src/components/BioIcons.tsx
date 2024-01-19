import { JSXElement } from "solid-js";
import ExternalLink from "./ExternalLink";

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
            {'text' in props ? props.text : <ExternalLink href={props.href}> {props.href} </ExternalLink>}
        </span>
    );
}
