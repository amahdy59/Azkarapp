import { SHARED_APP_URL } from "./shareDispatcher";

/** Append branding outside the supplied artwork; never cover or crop devotional text. */
export async function attributeCardImage(blob: Blob, mimeType = "image/webp"): Promise<Blob> {
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height) throw new Error("Unavailable card image");
    const footerHeight = Math.ceil(width * 0.085);
    canvas.width = width;
    canvas.height = height + footerHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Card image canvas unavailable");
    ctx.drawImage(image, 0, 0);
    ctx.fillStyle = "#101b2d";
    ctx.fillRect(0, height, width, footerHeight);
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${Math.max(12, Math.round(width * 0.032))}px sans-serif`;
    ctx.direction = "ltr";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(SHARED_APP_URL.replace(/^https:\/\//, "").replace(/\/$/, ""), width / 2, height + footerHeight / 2);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Card image encoding failed"))),
        mimeType,
        0.95,
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
