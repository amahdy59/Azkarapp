import { readFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import { inflateSync } from "node:zlib";
import { expect, it } from "vitest";

it("ships small fine neutral grain without coarse coloured particles or excessive tint", () => {
  const sizes = [];
  for (const [name, maximum] of [
    ["light", 28],
    ["dark", 20],
  ]) {
    const bytes = readFileSync(`src/assets/paper-grain-${name}.png`);
    sizes.push(bytes.length);
    expect(bytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const chunks = new Map();
    for (let offset = 8; offset < bytes.length;) {
      const size = bytes.readUInt32BE(offset);
      chunks.set(bytes.toString("ascii", offset + 4, offset + 8), bytes.subarray(offset + 8, offset + 8 + size));
      offset += size + 12;
    }
    const header = chunks.get("IHDR");
    const size = 128;
    expect([header.readUInt32BE(0), header.readUInt32BE(4), header[9]]).toEqual([size, size, 3]);
    const bits = header[8];
    expect(bits).toBe(name === "light" ? 4 : 8);
    const palette = chunks.get("PLTE"),
      alpha = chunks.get("tRNS");
    expect(Math.max(...alpha)).toBeLessThanOrEqual(maximum);
    for (let offset = 0; offset < palette.length; offset += 3) {
      if (name === "dark")
        expect([...palette.subarray(offset, offset + 3)]).toEqual([palette[offset], palette[offset], palette[offset]]);
      else expect([...palette.subarray(offset, offset + 3)]).toEqual([128, 128, 128]);
    }
    const rows = inflateSync(chunks.get("IDAT"));
    const stride = (size * bits) / 8 + 1;
    expect(rows).toHaveLength(stride * size);
    if (name === "dark") {
      // The owner requests more visible dark paper. Bound actual pixel-weighted
      // opacity, not just an unused palette entry, without restoring heavy grain.
      let totalAlpha = 0;
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) totalAlpha += alpha[rows[y * stride + x + 1]];
      expect(totalAlpha / (size * size)).toBeGreaterThan(11);
      expect(totalAlpha / (size * size)).toBeLessThan(13);
      expect(Math.max(...alpha)).toBeGreaterThanOrEqual(18);
    }
    if (name === "light") {
      // The selected soft-paper trial replaces discrete pores with a gentle
      // continuous field. Keep visible variation, lower the peak ink, and
      // disallow both flat paint and sparse pepper-like particles.
      const ink = [];
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
          const packed = rows[y * stride + Math.floor(x / 2) + 1];
          const index = x % 2 === 0 ? packed >> 4 : packed & 15;
          ink.push(Math.round(((255 - palette[index * 3]) * alpha[index]) / 255));
        }
      const sorted = [...ink].sort((a, b) => a - b);
      const mean = ink.reduce((sum, value) => sum + value, 0) / ink.length;
      expect(mean).toBeGreaterThan(3);
      expect(mean).toBeLessThan(5);
      const spread = sorted[Math.floor(ink.length * 0.9)] - sorted[Math.floor(ink.length * 0.1)];
      expect(spread).toBeGreaterThanOrEqual(4);
      expect(spread).toBeLessThanOrEqual(6);
      const clear = ink.filter((value) => value === 0).length / ink.length;
      expect(clear).toBeLessThan(0.05);
      expect(Math.max(...ink)).toBeLessThanOrEqual(14);
      // Repetition must not introduce a stronger edge than the grain itself.
      let seam = 0,
        interior = 0;
      for (let y = 0; y < size; y++) {
        seam += Math.abs(ink[y * size] - ink[y * size + size - 1]);
        for (let x = 1; x < size; x++) interior += Math.abs(ink[y * size + x] - ink[y * size + x - 1]);
      }
      expect(seam / size).toBeLessThanOrEqual((interior / (size * (size - 1))) * 1.25);
      let verticalSeam = 0,
        verticalInterior = 0;
      for (let x = 0; x < size; x++) {
        verticalSeam += Math.abs(ink[x] - ink[(size - 1) * size + x]);
        for (let y = 1; y < size; y++) verticalInterior += Math.abs(ink[y * size + x] - ink[(y - 1) * size + x]);
      }
      expect(verticalSeam / size).toBeLessThanOrEqual((verticalInterior / (size * (size - 1))) * 1.25);
    }
  }
  expect(sizes.reduce((a, b) => a + b, 0)).toBeLessThan(14000);
});
