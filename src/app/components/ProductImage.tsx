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
export type ProductImageName = "mosque_prophet";

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
  const base = `${import.meta.env.BASE_URL}images/${name}`;
  const srcSet = (format: "avif" | "webp") =>
    (format === "avif" ? [192, 384, 768] : [192, 384])
      .map((width) => `${base}-${width}.${format} ${width}w`)
      .join(", ");
  return (
    <picture
      className="absolute inset-0 block bg-cover bg-center"
      style={{ backgroundImage: `url(${base}-placeholder.webp)` }}
    >
      <source srcSet={srcSet("avif")} sizes={sizes} type="image/avif" />
      <img
        src={`${base}-384.webp`}
        srcSet={srcSet("webp")}
        sizes={sizes}
        alt=""
        width={768}
        height={768}
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
