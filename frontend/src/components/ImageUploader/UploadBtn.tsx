import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createSignal, mergeProps } from "solid-js";
import { ChangeEvent } from "~/lib/solidTypes";
import { UploadSvg } from "~/svgs";
import { storage } from "../../../firebase";
import auth from "~/globalState/auth";
import type { CreateMutationResult, QueryKey } from "@tanstack/solid-query";
import { Popup } from "../shared/Popup";
import { Portal } from "solid-js/web";

type Props = {
    path: "avatar" | "banner",
    invalidate?: QueryKey
    mutation: CreateMutationResult<void, Error, {
        field: "avatar" | "banner";
        url: string;
    }, unknown>

}
export function UploadBtn(props: Props) {
    const merged = mergeProps({ limit: 1 }, props)
    let inputElement!: HTMLInputElement;
    const [error, setError] = createSignal("")
    
    async function selectFiles(e: ChangeEvent<HTMLInputElement>) {
        if (!auth.user.userId) return
        const files = Array.from(e.target.files ?? []).slice(0, merged.limit)
        try {
            const urls = await Promise.all(validateAndUpload(files, `${merged.path}s`))
            urls.length && props.mutation.mutate({ field: props.path, url: urls[0] },)
        } catch (error: any) {
            setError(error.message ?? "Something went wrong please try again later")
        }
    }

    return (
        <>
            <button type="button" onclick={() => inputElement.click()}>
                <UploadSvg />
                <input type="file" onchange={selectFiles} hidden ref={inputElement} accept="image/*" multiple={merged.limit > 1} />
            </button>
            <Portal>
                <Popup
                    text={error()}
                    close={() => setError("")}
                    when={!!error()}
                />
            </Portal>
        </>
    );
}

function validateAndUpload(files: File[], path: string, maxSize = 1) {
    if (files.some(file => file.size > maxSize * 1024 * 1024))
        throw new Error(`Files may not exceed ${maxSize}Mb`)
    return files.map(file => uploadFile(file, path))
}

async function uploadFile(file: File, path: string) {
    const imageRef = ref(storage, `${auth.user.userId}/${path}/${file.name}`)
    const res = await uploadBytes(imageRef, file)
    return getDownloadURL(res.ref)
}