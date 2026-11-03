import { chromium } from "playwright";
import { Buffer } from "node:buffer";
/* global Image, document -- evaluated only inside the build-time browser page. */
import { writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
// Authored material primitive inspired by the owner's reference, rasterized once.
const browser = await chromium.launch();
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function chunk(name, data) {
  const kind = Buffer.from(name),
    body = Buffer.concat([kind, data]);
  let crc = 0xffffffff;
  for (const n of body) crc = crcTable[(crc ^ n) & 255] ^ (crc >>> 8);
  const header = Buffer.alloc(4),
    tail = Buffer.alloc(4);
  header.writeUInt32BE(data.length);
  tail.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([header, body, tail]);
}

try {
  const p = await browser.newPage();
  // Periodic value noise, authored entirely in code. Adjacent, softly
  // correlated samples make paper fibres rather than isolated pepper dots.
  // Integer periods wrap exactly at tile boundaries; fixed seeds reproduce it.
  function noise(x, y, cells, seed) {
    const px = (x / 128) * cells,
      py = (y / 128) * cells;
    const ix = Math.floor(px),
      iy = Math.floor(py);
    const smooth = (t) => t * t * (3 - 2 * t);
    const mix = (a, b, t) => a + (b - a) * t;
    const sample = (a, b) => {
      let n = Math.imul((a % cells) + seed, 374761393) ^ Math.imul((b % cells) + seed, 668265263);
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
    };
    return mix(
      mix(sample(ix, iy), sample(ix + 1, iy), smooth(px - ix)),
      mix(sample(ix, iy + 1), sample(ix + 1, iy + 1), smooth(px - ix)),
      smooth(py - iy),
    );
  }
  const softGray = Array.from({ length: 128 * 128 }, (_, i) => {
    const x = i % 128,
      y = Math.floor(i / 128);
    return noise(x, y, 96, 7) * 0.7 + noise(x, y, 64, 19) * 0.25 + noise(x, y, 32, 31) * 0.05;
  });
  // Match the sampled edge pixels as well as the underlying periodic field.
  // Two-pixel feathering prevents a quantized seam without broad cloudy bands.
  for (const axis of ["x", "y"])
    for (let line = 0; line < 128; line++)
      for (let edge = 0; edge < 2; edge++) {
        const a = axis === "x" ? line * 128 + edge : edge * 128 + line;
        const b = axis === "x" ? line * 128 + 127 - edge : (127 - edge) * 128 + line;
        const first = softGray[a],
          last = softGray[b],
          weight = (1 - edge / 2) / 2;
        softGray[a] = first * (1 - weight) + last * weight;
        softGray[b] = last * (1 - weight) + first * weight;
      }
  const mean = softGray.reduce((sum, value) => sum + value, 0) / softGray.length;
  const deviation = Math.sqrt(softGray.reduce((sum, value) => sum + (value - mean) ** 2, 0) / softGray.length);
  const pixels = await p.evaluate(async () => {
    const size = 128;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#paper)"/></svg>`;
    const img = new Image();
    img.src = "data:image/svg+xml," + encodeURIComponent(svg);
    await img.decode();
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return Array.from(ctx.getImageData(0, 0, size, size).data);
  });
  for (const name of ["light", "dark"]) {
    const size = 128;
    const source = pixels;
    const palette = [],
      indices = [],
      lookup = new Map();
    for (let i = 0; i < source.length; i += 4) {
      const gray = Math.round(source[i] / 32) * 32;
      const rgb = name === "light" ? [128, 128, 128] : [gray, gray, gray];
      // The new light candidate is continuous procedural paper, without the
      // previous pore cut. A narrow neutral alpha palette keeps the material
      // soft and small. A modest opacity gain makes dark paper more visible;
      // retain its original quantization so frequency and transfer size stay stable.
      const darkAlpha = Math.round((source[i + 3] * 0.07) / 3) * 3;
      const alpha =
        name === "light"
          ? Math.round(Math.max(0, Math.min(28, 8 + ((mean - softGray[i / 4]) / deviation) * 4)) / 2) * 2
          : Math.round(darkAlpha * 1.35);
      const key = `${rgb},${alpha}`;
      if (!lookup.has(key)) {
        lookup.set(key, palette.length);
        palette.push({ rgb, alpha });
      }
      indices.push(lookup.get(key));
    }
    if (palette.length > 256) throw Error("Texture palette overflow");
    const bits = palette.length <= 16 ? 4 : 8;
    const stride = (size * bits) / 8 + 1;
    const rows = Buffer.alloc(stride * size);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const offset = y * stride + 1 + Math.floor((x * bits) / 8);
        rows[offset] |= indices[y * size + x] << (bits === 4 && x % 2 === 0 ? 4 : 0);
      }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = bits;
    ihdr[9] = 3;
    const png = Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", ihdr),
      chunk("PLTE", Buffer.from(palette.flatMap((x) => x.rgb))),
      chunk("tRNS", Buffer.from(palette.map((x) => x.alpha))),
      chunk("IDAT", deflateSync(rows, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]);
    await writeFile(`src/assets/paper-grain-${name}.png`, png);
    console.log(
      JSON.stringify({
        name,
        size,
        bytes: png.length,
        colors: palette.length,
        alpha: [Math.min(...palette.map((x) => x.alpha)), Math.max(...palette.map((x) => x.alpha))],
      }),
    );
  }
} finally {
  await browser.close();
}
