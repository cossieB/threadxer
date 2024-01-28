import { For, JSXElement, createSignal, onCleanup } from "solid-js"
import styles from '~/styles/components/DropZone.module.scss'
import { UploadSvg } from "~/svgs"
import { MediaPreview } from "./MediaPreview"
import { errors } from "~/globalState/popups"

const MAX_FILE_SIZE = 8

export default function DropZone() {
    const [hovered, setHovered] = createSignal(false)
    const [objUrls, setObjUrls] = createSignal<string[]>([])
    let input!: HTMLInputElement
    const cleanUpUrls = () => objUrls().forEach(url => URL.revokeObjectURL(url))

    function selectFiles(files: File[]) {
        if (files.some(file => file.size >= MAX_FILE_SIZE * 1024 * 1024))
            errors.addError("Warning some of your files are too big and have been ignored")
        const remainder = 4 - objUrls().length
        const urls = files.filter(file => file.type.match(/(image|video)/) && file.size < MAX_FILE_SIZE * 1024 * 1024).map(file => URL.createObjectURL(file)).slice(0, remainder);
        setObjUrls(prev => [...prev, ...urls])
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
                <UploadSvg /> &nbsp;
                <small>{`max: ${MAX_FILE_SIZE}MB`}</small>
            </div>
            <div class={styles.imgs}>
                <MediaPreview setImages={setObjUrls} images={objUrls()} />
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