export function readFile(fn: (src: string) => void, file: File) {
    const reader = new FileReader();
    reader.onload = () => {
        typeof reader.result == 'string' && fn(reader.result);
    };
    reader.readAsDataURL(file);
}
