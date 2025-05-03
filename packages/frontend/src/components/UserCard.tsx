import styles from "~/styles/components/PostBox.module.scss"
import { PostBoxAvatar } from "./PostBox/PostBox.components"
import { A } from "@solidjs/router"

type Props = {
    avatar: string
    bio: string
    displayName: string,
    username: string
}

export function UserCard(props: Props) {
    return (
        <div class={styles.box}>
            <PostBoxAvatar {...props} />
            <div class={styles.header} >
                <A href={`/users/${props.username}`} >
                    <span class={styles.username} > {props?.username} </span> &nbsp;
                    <span class={styles.displayName} > @{props?.displayName} </span>
                </A>
            </div>
            <div class={styles.content}>
                {props.bio}
            </div>
        </div>
    )
}