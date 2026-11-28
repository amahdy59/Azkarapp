import { writeFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import { deflateSync } from "node:zlib";
import qrcode from "qrcode-generator";

// Public immutable code: bundle a compact monochrome PNG, never a remote QR service.
const url = "https://play.google.com/store/apps/details?id=m.azkar.com";
const code = qrcode(0, "M");
code.addData(url);
code.make();
const cell = 8;
const margin = 4;
const modules = code.getModuleCount();
const size = (modules + margin * 2) * cell;
const stride = Math.ceil(size / 8);
const pixels = Buffer.alloc((stride + 1) * size, 255);
for (let y = 0; y < size; y += 1) {
  pixels[y * (stride + 1)] = 0;
  const row = Math.floor(y / cell) - margin;
  for (let x = 0; x < size; x += 1) {
    const column = Math.floor(x / cell) - margin;
    if (row >= 0 && row < modules && column >= 0 && column < modules && code.isDark(row, column))
      pixels[y * (stride + 1) + 1 + (x >> 3)] &= ~(1 << (7 - (x & 7)));
  }
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of body) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  const result = Buffer.alloc(body.length + 8);
  result.writeUInt32BE(data.length);
  body.copy(result, 4);
  result.writeUInt32BE((crc ^ 0xffffffff) >>> 0, result.length - 4);
  return result;
}
const header = Buffer.alloc(13);
header.writeUInt32BE(size);
header.writeUInt32BE(size, 4);
header[8] = 1; // One-bit grayscale: opaque black and white, no palette/alpha.
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", header),
  chunk("IDAT", deflateSync(pixels, { level: 9, windowBits: 9, memLevel: 3 })),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync(
  "src/assets/app-sharing/google-play.json",
  `${JSON.stringify({ url, image: `data:image/png;base64,${png.toString("base64")}` }, null, 2)}\n`,
);
console.log(`Bundled ${size}×${size} public QR: ${png.length} PNG bytes.`);
