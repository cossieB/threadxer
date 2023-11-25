import styles from "~/styles/components/Composer.module.scss"

export function PostComposer() {
    return (
        <div class={styles.composer}>
            <div contentEditable />
        </div>
    );
}
