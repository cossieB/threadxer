import { For, JSXElement, createSignal, onCleanup } from "solid-js"
import styles from '~/styles/components/DropZone.module.scss'
import { UploadSvg } from "~/svgs"

export default function DropZone() {
    const [hovered, setHovered] = createSignal(false)
    const [objUrls, setObjUrls] = createSignal<string[]>([])
    let input!: HTMLInputElement
    const cleanUpUrls = () => objUrls().forEach(url => URL.revokeObjectURL(url))

    function selectFiles(files: File[]) {
        cleanUpUrls()
        const o = files.map(file => URL.createObjectURL(file)).slice(0, 4);
        setObjUrls(o)
        setHovered(false)
    }

    onCleanup(() => {
        cleanUpUrls()
    })
    return (
        <>
            <div
                aria-label="dropzone"
                class={styles.z}
                classList={{ [styles.dragover]: hovered() }}
                onclick={() => input.click()}
                onDragOver={(e) => {
                    e.preventDefault()
                    setHovered(true)

                }}
                onDragLeave={(e) => {
                    e.preventDefault()
                    setHovered(false)
                }}
                onDrop={e => {
                    e.preventDefault();
                    if (!e.dataTransfer?.files) return;
                    selectFiles(Array.from(e.dataTransfer.files))
                }}
            >
                <UploadSvg />
            </div>
            <div class={styles.imgs}>
                <For each={objUrls()}>
                    {url =>
                        <img src={url} />
                    }
                </For>
                <input
                    type="file"
                    accept="image/*, video/*"
                    ref={input}
                    multiple
                    onChange={e => {
                        if (!e.target.files) return;
                        selectFiles(Array.from(e.target.files))
                    }}
                    hidden />
            </div>
        </>
    )
}