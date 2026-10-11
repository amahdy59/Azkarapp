import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { URL } from "node:url";

// Integrated application fonts only; owner confirmed an active QF account.
const version = "2026-10-11";
const pages = [42, 49, 603, 604];
const directory = new URL(`../public/fonts/qcf-v2/${version}/`, import.meta.url);
const fonts = await Promise.all(
  pages.map(async (page) => {
    const source = `https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p${page}.woff2`;
    const response = await globalThis.fetch(source, { signal: globalThis.AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Font ${page}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.subarray(0, 4).toString("ascii") !== "wOF2" || bytes.length > 1024 * 1024)
      throw new Error(`Font ${page}: invalid or oversized WOFF2`);
    return { page, source, bytes, sha256: createHash("sha256").update(bytes).digest("hex") };
  }),
);
await mkdir(directory, { recursive: true });
for (const font of fonts) await writeFile(new URL(`p${font.page}.woff2`, directory), font.bytes);
await writeFile(
  new URL("manifest.json", directory),
  JSON.stringify(
    {
      version,
      provider: "Quran Foundation",
      credit: "https://quran.foundation",
      terms: "https://api-docs.quran.com/legal/developer-terms/",
      fonts: fonts.map(({ page, source, bytes, sha256 }) => ({ page, source, bytes: bytes.length, sha256 })),
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Bundled ${fonts.length} QCF v2 page fonts (${fonts.reduce((total, font) => total + font.bytes.length, 0)} bytes).`,
);
