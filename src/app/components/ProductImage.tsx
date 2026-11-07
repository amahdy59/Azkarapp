import { homeArtworkUrl } from "./azkar-backgrounds";
/**
 * Decorative product illustration, served AVIF-first with a WebP fallback.
 *
 * These two images shipped as 1254x1254 PNGs at roughly 1.7 MB each — 3.3 MB of
 * a 5.8 MB precache, for artwork that renders at a few hundred CSS pixels. The
 * encoded pair is about 4% of that at the same dimensions and ~40 dB PSNR
 * (DEC-072). There is no PNG fallback on purpose: every browser that can run
 * this app supports WebP, and keeping a PNG would have left the 3.3 MB in the
 * precache, which is the whole cost being removed.
 *
 * Regenerate with design-sources/azkar-responsive-assets/tools/export_product_images.py.
 */
export type ProductImageName = "mosque_prophet" | "benefits_zikr";

export function ProductImage({
  name,
  className = "",
  loading = "lazy",
  sizes,
}: {
  name: ProductImageName;
  className?: string;
  /** The LCP hero should pass "eager"; everything else stays lazy. */
  loading?: "lazy" | "eager";
  sizes?: string;
}) {
  const responsive = name === "mosque_prophet";
  const base = responsive ? `${import.meta.env.BASE_URL}images/${name}` : homeArtworkUrl(`images/${name}`);
  const srcSet = (format: "avif" | "webp") =>
    responsive
      ? (format === "avif" ? [192, 384, 768] : [192, 384])
          .map((width) => `${base}-${width}.${format} ${width}w`)
          .join(", ")
      : `${base}.${format}`;
  return (
    <picture
      className="absolute inset-0 block bg-cover bg-center"
      style={{ backgroundImage: `url(${base}-placeholder.webp)` }}
    >
      <source srcSet={srcSet("avif")} sizes={sizes} type="image/avif" />
      <img
        src={`${base}${responsive ? "-384" : ""}.webp`}
        srcSet={responsive ? srcSet("webp") : undefined}
        sizes={sizes}
        alt=""
        width={responsive ? 768 : 1254}
        height={responsive ? 768 : 1254}
        loading={loading}
        decoding="async"
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
        className={className}
      />
    </picture>
  );
}
