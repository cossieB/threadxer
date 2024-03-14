import { createSignal, mergeProps } from "solid-js";
import type { ChangeEvent } from "~/lib/solidTypes";
import { UploadSvg } from "~/svgs";
import auth from "~/globalState/auth";
import type { CreateMutationResult, QueryKey } from "@tanstack/solid-query";
import { Popup } from "../shared/Popup";
import { Portal } from "solid-js/web";
import { validateAndUpload } from "~/utils/uploadToFirebase";

type Props = {
    path: "avatar" | "banner",
    invalidate?: QueryKey
    mutation: CreateMutationResult<{
        jwt: string;
        fb: string;
    }, Error, {
        displayName?: string | undefined;
        bio?: string | undefined;
        website?: string | null | undefined;
        location?: string | undefined;
        avatar?: string | undefined;
        banner?: string | undefined;
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
            urls.length && props.mutation.mutate({ [props.path]: urls[0].url },)
        } 
        catch (error: any) {
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