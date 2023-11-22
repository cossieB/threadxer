import { A } from "@solidjs/router"
import { JSX, Show, createSignal } from "solid-js"
import styles from "~/styles/components/Nav.module.scss"
import { setUser, user } from "../user"
import { HomeSvg, SearchSvg, SettingsSvg, UnlockSvg } from "../svgs"
import { Portal } from "solid-js/web"
import { Login } from "./auth/Login"


export default function Navbar() {
    async function logout() {
        const res = await fetch('/api/auth/logout', {
            method: "DELETE"
        })
        if (res.ok)
            setUser({
                avatar: "",
                banner: "",
                email: "",
                username: ""
            })
    }
    return (
        <nav class={styles.nav}>
            <div><img class={styles.logo} src="/favicon.ico" alt="" /></div>
            <NavLink
                href="/"
                text="Home"
                icon={<HomeSvg />}
            />
            <NavLink
                href="search"
                text="Search"
                icon={<SearchSvg />}
            />
            <Show
                when={user.username}
                fallback={
                    <NavLink
                        icon={<UnlockSvg />}
                        text="Login"
                        href="/auth/login"
                    />
                }
            >
                <NavLink
                    href="/profile"
                    text="Profile"
                    icon={<SettingsSvg />}
                />
                <NavItem
                    onclick={logout}
                    text={user.username}
                    icon={<img src={user.avatar} />}
                    
                />
            </Show>
        </nav>
    )
}

type P = {
    href: string
    icon: JSX.Element
    text: string
}

function NavLink(props: P) {
    return (
        <A class={styles.a} href={props.href}>
            <span> {props.icon} </span>
            <span>{props.text}</span>
        </A>
    )
}
type P2 = {
    onclick: () => void
} & Omit<P, 'href'>

function NavItem(props: P2) {
    return (
        <div class={styles.a} onclick={props.onclick}>
            <span> {props.icon} </span>
            <span>{props.text}</span>
        </div>
    )
}