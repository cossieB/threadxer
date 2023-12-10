import { A } from "@solidjs/router"
import { JSX, Show } from "solid-js"
import styles from "~/styles/components/Nav.module.scss"
import { deleteUser, setToken, setUser, user } from "../globalState/user"
import { CompostSvg, HomeSvg, RegisterSvg, SearchSvg, SettingsSvg, UnlockSvg } from "../svgs"
import { setComposerOpen } from "~/App"


export default function Navbar() {
    async function logout() {
        const res = await fetch('/api/auth/logout', {
            method: "DELETE"
        })
        if (res.ok) {
            deleteUser()
        }
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
                    <>
                        <NavLink
                            icon={<UnlockSvg />}
                            text="Login"
                            href="/auth/login"
                        />
                        <NavLink
                            icon={<RegisterSvg />}
                            text="Signup"
                            href="/auth/signup"
                        />
                    </>
                }
            >
                <Show when={!user.isUnverified}>
                    <NavItem
                        icon={<CompostSvg />}
                        text="Compose"
                        onclick={() => { setComposerOpen(prev => !prev) }}
                    />
                </Show>
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

