import { PLAY_STORE_QR, PLAY_STORE_URL } from "./appShareLinks";
import { isNativeAndroid, shareWithAndroid } from "./nativeSharing";
import { canShareMultipleFiles } from "./shareDispatcher";

export function canShareApplication(): boolean {
  return isNativeAndroid() || typeof navigator.share === "function";
}

/** Invoke the platform chooser in the original click, before any asynchronous preparation. */
export async function shareApplication(title: string, file: File | null): Promise<"shared" | "cancelled"> {
  try {
    const payload =
      file && canShareMultipleFiles([file])
        ? { title, text: PLAY_STORE_URL, files: [file] }
        : { title, url: PLAY_STORE_URL };
    if (isNativeAndroid()) await shareWithAndroid(payload);
    else await navigator.share(payload);
    return "shared";
  } catch (error) {
    if ((error instanceof DOMException || error instanceof Error) && error.name === "AbortError") return "cancelled";
    throw error;
  }
}

/** Public, device-independent codes; no account token, QR service or network request. */
export function prepareAppQrFile(): File {
  const bytes = Uint8Array.from(atob(PLAY_STORE_QR.slice(PLAY_STORE_QR.indexOf(",") + 1)), (value) =>
    value.charCodeAt(0),
  );
  return new File([bytes], "wa-zaker-qr.png", { type: "image/png" });
}
