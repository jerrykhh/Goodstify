
export const copy2Clipboard = (text: string) => {
    navigator.clipboard.writeText(text);
}