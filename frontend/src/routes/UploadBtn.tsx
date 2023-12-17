import { StorageReference, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createSignal, mergeProps } from "solid-js";
import { ChangeEvent } from "~/lib/solidTypes";
import { UploadSvg } from "~/svgs";
import { storage } from "../../firebase";
import { user } from "~/globalState/user";


type Props = {
    limit?: number
    path: string
}

// const {isUploading, startUpload} = useUploadThing('videoAndImage', {})

export function UploadBtn(props: Props) {
    const merged = mergeProps({ limit: 1 }, props)
    let inputElement!: HTMLInputElement;
    const [files, setFiles] = createSignal<File[]>([])

    async function selectFiles(e: ChangeEvent<HTMLInputElement>) {
        if (!user.userId) return
        const files = Array.from(e.target.files ?? []).slice(0, merged.limit)
        setFiles(files)
        const urls = await Promise.all(validateAndUpload(files, 'avatars'))
        console.log(urls)
    }

    return (
        <button type="button" onclick={() => inputElement.click()}>
            <UploadSvg />
            <input type="file" onchange={selectFiles} hidden ref={inputElement} accept="image/*" multiple={merged.limit > 1} />
        </button>
    );
}

function validateAndUpload(files: File[], path: string, maxSize = 1) {
    if (files.some(file => file.size > maxSize * 1024 * 1024))
        throw new Error(`Files may not exceed ${maxSize}kb`)
    return files.map(file => uploadFile(file, path))
}

async function uploadFile(file: File, path: string) {
    const imageRef = ref(storage, `${user.userId}/${path}/${file.name}`)
    const res = await uploadBytes(imageRef, file)
    return getDownloadURL(res.ref)
}