import { For, JSXElement, Setter, createSignal, onCleanup } from "solid-js"
import styles from '~/styles/components/DropZone.module.scss'
import { UploadSvg } from "~/svgs"
import { MediaPreview } from "./MediaPreview"
import { errors } from "~/globalState/popups"

type P = {
    images: {
        url: string;
        file: File;
    }[]
    setImages: Setter<{
        url: string;
        file: File;
    }[]>
}

const MAX_FILE_SIZE = 8

export default function DropZone(props: P) {
    const [hovered, setHovered] = createSignal(false)

    let input!: HTMLInputElement

    function selectFiles(fileList: File[]) {
        if (fileList.some(file => file.size >= MAX_FILE_SIZE * 1024 * 1024))
            errors.addError("Warning some of your files are too big and have been ignored")
        const remainder = 4 - props.images.length
        const urls = fileList
            .filter(file => file.type.match(/(image|video)/) && file.size < MAX_FILE_SIZE * 1024 * 1024)
            .map(file => ({ url: URL.createObjectURL(file), file })).slice(0, remainder);
        props.setImages(prev => [...prev, ...urls])
        setHovered(false)
    }

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
                <MediaPreview setImages={props.setImages} images={props.images} />
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