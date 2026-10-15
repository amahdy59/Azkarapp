import { Capacitor, registerPlugin } from "@capacitor/core";

interface NativeShareFile {
  name: string;
  mimeType: string;
  data: string;
}

interface NativeSharingPlugin {
  share(options: { title?: string; text?: string; url?: string; files?: NativeShareFile[] }): Promise<void>;
  saveFile(options: { file: NativeShareFile }): Promise<void>;
}

const NativeSharing = registerPlugin<NativeSharingPlugin>("NativeSharing");

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

async function toNativeFile(file: File): Promise<NativeShareFile> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return {
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    data: btoa(binary),
  };
}

export async function shareWithAndroid(options: {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}): Promise<void> {
  const files = options.files ? await Promise.all(options.files.map(toNativeFile)) : undefined;
  await NativeSharing.share({ ...options, files });
}

export async function saveWithAndroid(file: File): Promise<void> {
  await NativeSharing.saveFile({ file: await toNativeFile(file) });
}
