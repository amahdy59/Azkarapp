/**
 * shareDispatcher.ts — Handles Web Share Level 2 multi-file sharing with
 * fallback downloading for desktop and older browsers.
 */

export type MultiShareMethod = "shared" | "downloaded" | "cancelled" | "error";

export interface MultiShareResult {
  method: MultiShareMethod;
  fileCount: number;
}

/**
 * Checks if the browser supports sharing an array of files via Web Share Level 2.
 */
export function canShareMultipleFiles(files: File[]): boolean {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.share !== "function" ||
    typeof navigator.canShare !== "function"
  ) {
    return false;
  }
  try {
    return navigator.canShare({ files });
  } catch {
    return false;
  }
}

/**
 * Checks if the browser supports copying image blobs to the clipboard.
 */
export function canCopyImage(): boolean {
  return (
    typeof navigator !== "undefined" && Boolean(navigator.clipboard?.write) && typeof ClipboardItem !== "undefined"
  );
}

/**
 * Copies a PNG blob directly to the system clipboard.
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  if (!canCopyImage()) return false;
  try {
    const item = new ClipboardItem({ [blob.type || "image/png"]: blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Shares a single file using Web Share API or falls back to downloading.
 */
export async function shareSingleFile(
  file: File,
  options: {
    title?: string;
    text?: string;
    downloadFallback?: boolean;
    onStatus?: (status: "sharing" | "downloading" | "shared" | "downloaded" | "cancelled") => void;
  } = {},
): Promise<MultiShareResult> {
  if (!file) {
    return { method: "error", fileCount: 0 };
  }

  if (canShareMultipleFiles([file])) {
    try {
      options.onStatus?.("sharing");
      await navigator.share({
        files: [file],
        title: options.title,
        text: options.text,
      });
      options.onStatus?.("shared");
      return { method: "shared", fileCount: 1 };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        options.onStatus?.("cancelled");
        return { method: "cancelled", fileCount: 1 };
      }
      if (options.downloadFallback === false) throw err;
    }
  }

  // Fallback to downloading
  if (options.downloadFallback === false) throw new Error("File sharing unavailable.");
  options.onStatus?.("downloading");
  downloadFile(file);
  options.onStatus?.("downloaded");
  return { method: "downloaded", fileCount: 1 };
}

/**
 * Downloads a single File by triggering a temporary anchor element click.
 */
export function downloadFile(file: File): void {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Downloads multiple files sequentially with a small delay to prevent browser download throttling.
 */
export async function downloadFilesSequentially(files: File[], delayMs = 180): Promise<void> {
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    if (!file) continue;
    downloadFile(file);
    if (i < files.length - 1 && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Shares multiple files directly via Web Share API Level 2 (e.g. into WhatsApp, Telegram, Stories).
 * If unsupported, downloads all files as a graceful fallback.
 */
export async function shareMultipleFiles(
  files: File[],
  options: {
    title?: string;
    text?: string;
    downloadFallback?: boolean;
    onStatus?: (status: "sharing" | "downloading" | "shared" | "downloaded" | "cancelled") => void;
  } = {},
): Promise<MultiShareResult> {
  if (!files || files.length === 0) {
    return { method: "error", fileCount: 0 };
  }

  if (canShareMultipleFiles(files)) {
    try {
      options.onStatus?.("sharing");
      await navigator.share({
        files,
        title: options.title,
        text: options.text,
      });
      options.onStatus?.("shared");
      return { method: "shared", fileCount: files.length };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        options.onStatus?.("cancelled");
        return { method: "cancelled", fileCount: files.length };
      }
      // If native sharing fails unexpectedly, fall through to download
      if (options.downloadFallback === false) throw err;
    }
  }

  // Desktop or unsupported browser fallback
  if (options.downloadFallback === false) throw new Error("Multi-file sharing unavailable.");
  options.onStatus?.("downloading");
  await downloadFilesSequentially(files);
  options.onStatus?.("downloaded");
  return { method: "downloaded", fileCount: files.length };
}
