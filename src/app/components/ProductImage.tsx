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
}: {
  name: ProductImageName;
  className?: string;
  /** The LCP hero should pass "eager"; everything else stays lazy. */
  loading?: "lazy" | "eager";
}) {
  const base = `${import.meta.env.BASE_URL}images/${name}`;
  return (
    <picture>
      <source srcSet={`${base}.avif`} type="image/avif" />
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img
        src={`${base}.webp`}
        alt=""
        width={1254}
        height={1254}
        loading={loading}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
