import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import auth from "~/globalState/auth";
import { storage } from "../../firebase";

export function validateAndUpload(files: File[], path: string, maxSize = 1) {
    if (files.some(file => file.size > maxSize * 1024 * 1024))
        throw new Error(`Files may not exceed ${maxSize}Mb`)
    return files.map(file => uploadFile(file, path))
}


async function uploadFile(file: File, path: string) {
    const imageRef = ref(storage, `${auth.user.userId}/${path}/${file.name}`)
    const res = await uploadBytes(imageRef, file)
    return getDownloadURL(res.ref)
}