import { registerPlugin } from "@capacitor/core";

const Files = registerPlugin<{
  create(options: { name: string; mimeType: string }): Promise<{ token: string }>;
  append(options: { token: string; data: string }): Promise<void>;
  finish(options: { token: string }): Promise<void>;
  cancel(options: { token: string }): Promise<void>;
}>("AzkarFiles");

/** A bounded bridge transfer to Android's user-selected document; no storage permission. */
export async function saveNativeFile(file: File): Promise<void> {
  let token: string | undefined;
  try {
    ({ token } = await Files.create({ name: file.name, mimeType: file.type || "application/octet-stream" }));
    for (let offset = 0; offset < file.size; offset += 48 * 1024) {
      const bytes = new Uint8Array(await file.slice(offset, offset + 48 * 1024).arrayBuffer());
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      await Files.append({ token, data: btoa(binary) });
    }
    await Files.finish({ token });
  } catch (error) {
    if (token) await Files.cancel({ token }).catch(() => {});
    if ((error as { code?: string })?.code === "SAVE_CANCELLED") throw new DOMException("Save cancelled", "AbortError");
    throw error;
  }
}
