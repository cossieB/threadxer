import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createSignal, mergeProps } from "solid-js";
import { ChangeEvent } from "~/lib/solidTypes";
import { UploadSvg } from "~/svgs";
import { storage } from "../../../firebase";
import { user } from "~/globalState/user";
import type { CreateMutationResult, QueryKey } from "@tanstack/solid-query";


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

    async function selectFiles(e: ChangeEvent<HTMLInputElement>) {
        if (!user.userId) return
        const files = Array.from(e.target.files ?? []).slice(0, merged.limit)
        const urls = await Promise.all(validateAndUpload(files, `${merged.path}s`))
        urls.length && props.mutation.mutate({field: props.path, url: urls[0]},)
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