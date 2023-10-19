import styles from "~/styles/routes/CreatePost.module.scss"
import {createStore} from "solid-js/store"

export default function CreatePost() {
    const [post, setPost] = createStore({
        message: "",
        quotedPost: null as null | string,
        repliedPost: null as null | string
    })
    let editor!: HTMLDivElement

    return (
        <div>
            <div
                ref={editor}
                class={styles.editor}
                contentEditable
                onblur={() => {
                    editor.textContent && setPost('message', editor.textContent)
                }}
            />
            <button  >
                Submit
            </button>
        </div>
    )
}