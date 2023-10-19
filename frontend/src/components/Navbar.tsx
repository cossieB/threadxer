import { A } from "@solidjs/router"
import { JSX, Show, createResource } from "solid-js"
import styles from "~/styles/components/Nav.module.scss"
import { user } from "../user"
import { HomeSvg, SearchSvg } from "../svgs"


export default function Navbar() {
    async function logout() {
        
    }
    return (
        <nav class={styles.nav}>
            <NavItem
                href="Home"
                text="Home"
                icon={ <HomeSvg /> }
            />
            <NavItem
                href="Search"
                text="Search"
                icon={ <SearchSvg /> }
            />
            <span onclick={logout}>
                <Show when={user.username} fallback={"Login"}>
                    {user.username}
                </Show>
            </span>
        </nav>
    )
}

type P = {
    href: string
    icon: JSX.Element
    text: string
}

function NavItem(props: P) {
    return (
        <A href={props.href}>
            <span> {props.icon} </span>
            <span>{props.text}</span>
        </A>
    )
}

function User() {

}