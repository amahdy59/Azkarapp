import fs from "node:fs/promises";
import path from "node:path";

export async function publicationAssets(variant) {
  if (!["samples", "editions"].includes(variant)) throw new Error("Unknown publication style variant");
  const base = path.resolve(import.meta.dirname, "../docs");
  const fonts = JSON.parse(await fs.readFile(path.join(base, "external-sources/fonts_base64.json"), "utf8"));
  const css = await fs.readFile(path.join(base, "learning/publication-base.css"), "utf8");
  const variantCss = await fs.readFile(path.join(base, `learning/english-${variant}.css`), "utf8");
  const fontCss = `@font-face{font-family:PublicationUI;src:url(data:font/woff2;base64,${fonts.plex400});font-weight:400;font-display:swap}@font-face{font-family:PublicationUI;src:url(data:font/woff2;base64,${fonts.plex700});font-weight:700;font-display:swap}@font-face{font-family:PublicationQuran;src:url(data:font/woff2;base64,${fonts.amiri});font-weight:400;font-display:swap}`;
  return `${fontCss}\n${css}\n${variantCss}`;
}
