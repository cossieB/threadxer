import { createSignal, mergeProps } from "solid-js";
import { ChangeEvent } from "~/lib/solidTypes";
import { UploadSvg } from "~/svgs";
import { generateSolidHelpers } from "@uploadthing/solid";


type Props = {
    limit?: number
}
const { useUploadThing } = generateSolidHelpers({
    url: '/api/uploadthing'
})
// const {isUploading, startUpload} = useUploadThing('videoAndImage', {})

export function UploadBtn(props: Props) {
    const merged = mergeProps( {limit: 1}, props)
    let ref!: HTMLInputElement;
    const [files, setFiles] = createSignal<File[]>([])
    
    function selectFiles(e: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? [])
        startUpload(files)
    }

    return (
        <button type="button"  onclick={() => ref.click()}>
            <UploadSvg />
            <input type="file" onchange={selectFiles} hidden ref={ref} accept="image/*" />
        </button>
    );
}
