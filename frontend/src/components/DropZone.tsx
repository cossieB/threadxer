import { For, JSXElement, createSignal, onCleanup } from "solid-js"
import styles from '~/styles/components/DropZone.module.scss'
import { UploadSvg } from "~/svgs"
import { MediaPreview } from "./MediaPreview"
import { errors } from "~/globalState/popups"

const MAX_FILE_SIZE = 8

export default function DropZone() {
    const [hovered, setHovered] = createSignal(false)
    const [files, setFiles] = createSignal<{url: string, file: File}[]>([])
    let input!: HTMLInputElement
    const cleanUpUrls = () => files().forEach(file => URL.revokeObjectURL(file.url))

    function selectFiles(fileList: File[]) {
        if (fileList.some(file => file.size >= MAX_FILE_SIZE * 1024 * 1024))
            errors.addError("Warning some of your files are too big and have been ignored")
        const remainder = 4 - files().length
        const urls = fileList
            .filter(file => file.type.match(/(image|video)/) && file.size < MAX_FILE_SIZE * 1024 * 1024)
            .map(file => ({url: URL.createObjectURL(file), file})).slice(0, remainder);
        setFiles(prev => [...prev, ...urls])
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
                <MediaPreview setImages={setFiles} images={files()} />
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