import { UploadSvg } from "~/svgs";

export function UploadBtn() {
    let ref!: HTMLInputElement;
    return (
        <button type="button" onclick={() => ref.click()}>
            <UploadSvg />
            <input type="file" hidden ref={ref} accept="image/*" />
        </button>
    );
}
