/** Uncompressed ZIP: PNGs are already compressed. No runtime dependency required. */
export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
export async function createShareArchive(files: readonly File[], text: string): Promise<File> {
  const entries = [...files, new File([text], "azkar-text-and-sources.txt", { type: "text/plain;charset=utf-8" })];
  return createFileArchive(entries, "azkar-cards.zip");
}

/** Store original files without recompression; retain blobs rather than a second full byte copy. */
export async function createFileArchive(
  entries: Iterable<File> | AsyncIterable<File>,
  fileName: string,
  options: { signal?: AbortSignal } = {},
): Promise<File> {
  const localParts: BlobPart[] = [];
  const centralParts: Uint8Array<ArrayBuffer>[] = [];
  let offset = 0;
  let count = 0;
  for await (const file of entries) {
    options.signal?.throwIfAborted();
    if (++count > 65535 || file.size > 0xffffffff) throw new Error("ZIP size limit exceeded");
    const name = new TextEncoder().encode(file.name);
    // Bounded reads and yielding keep cancellation responsive for large recitations.
    let checksum = 0xffffffff;
    for (let start = 0; start < file.size; start += 1024 * 1024) {
      options.signal?.throwIfAborted();
      const chunk = new Uint8Array(await file.slice(start, start + 1024 * 1024).arrayBuffer());
      for (const byte of chunk) {
        checksum ^= byte;
        for (let bit = 0; bit < 8; bit++) checksum = (checksum >>> 1) ^ (checksum & 1 ? 0xedb88320 : 0);
      }
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
    options.signal?.throwIfAborted();
    const crc = (checksum ^ 0xffffffff) >>> 0;
    const local = new Uint8Array(30 + name.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x800, true);
    view.setUint16(12, 0x21, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, file.size, true);
    view.setUint32(22, file.size, true);
    view.setUint16(26, name.length, true);
    local.set(name, 30);
    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x800, true);
    cv.setUint16(14, 0x21, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, file.size, true);
    cv.setUint32(24, file.size, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    central.set(name, 46);
    localParts.push(local, file);
    centralParts.push(central);
    offset += local.length + file.size;
    if (offset > 0xffffffff) throw new Error("ZIP size limit exceeded");
  }
  const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, count, true);
  ev.setUint16(10, count, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  options.signal?.throwIfAborted();
  return new File([...localParts, ...centralParts, end], fileName, { type: "application/zip" });
}
