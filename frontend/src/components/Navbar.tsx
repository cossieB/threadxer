import { A } from "@solidjs/router"
import { JSX, Show, createSignal } from "solid-js"
import styles from "~/styles/components/Nav.module.scss"
import auth from "~/globalState/auth"
import { CompostSvg, HomeSvg, LogoutSvg, RegisterSvg, SearchSvg, SettingsSvg, UnlockSvg } from "../svgs"
import Modal from "./Modal";
import clickOutside from "~/lib/clickOutside"
import { setComposerState } from "~/globalState/composer"
false && clickOutside

export default function Navbar() {
    const [alertLogout, setAlertLogout] = createSignal(false)
    return (
        <nav class={styles.nav}>
            <div class={styles.logoContainer}>
                <img class={styles.logo} src="/favicon.ico" alt="" />
            </div>
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
                when={auth.user.username}
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
                <Show when={!auth.user.isUnverified}>
                    <NavItem
                        icon={<CompostSvg />}
                        text="Compose"
                        onclick={() => { setComposerState('isOpen', true) }}
                    />
                </Show>
                <NavLink
                    href={`/users/${auth.user.username}`}
                    text={auth.user.username}
                    icon={<img src={auth.user.avatar} />}
                />
                <NavLink
                    href="/profile"
                    text="Profile"
                    icon={<SettingsSvg />}
                />
                <NavItem
                    onclick={() => setAlertLogout(true)}
                    text="Logout"
                    icon={<LogoutSvg />}

                />
            </Show>
            <Modal when={alertLogout()} >
                <div use:clickOutside={() => setAlertLogout(false)}>
                    <strong>Confirm logout? </strong>{""}
                    <button class="danger" onclick={auth.logout}>Logout</button>
                </div>
            </Modal>
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
            <span class={styles.text}>{props.text}</span>
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
            <span class={styles.text}>{props.text}</span>
        </div>
    )
}
