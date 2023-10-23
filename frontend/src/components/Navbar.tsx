import { A } from "@solidjs/router"
import { JSX, Show } from "solid-js"
import styles from "~/styles/components/Nav.module.scss"
import { setUser, user } from "../user"
import { HomeSvg, SearchSvg, SettingsSvg } from "../svgs"


export default function Navbar() {
    async function logout() {
        const res = await fetch('/api/auth/logout', {
            method: "DELETE"
        })
        if (res.ok)
            setUser({})
    }
    return (
        <nav class={styles.nav}>
            <img class={styles.logo} src="/favicon.ico" alt="" />
            <NavItem
                href="/"
                text="Home"
                icon={<HomeSvg />}
            />
            <NavItem
                href="search"
                text="Search"
                icon={<SearchSvg />}
            />
            <Show when={user.username}>
                <NavItem
                    href="/profile"
                    text="Profile"
                    icon={<SettingsSvg />}
                />
                <NavItem
                    href="/logout"
                    text="logout"
                    icon={<img src={user.avatar} />}
                />
            </Show>
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
        <A class={styles.a} href={props.href}>
            <span> {props.icon} </span>
            <span>{props.text}</span>
        </A>
    )
}
