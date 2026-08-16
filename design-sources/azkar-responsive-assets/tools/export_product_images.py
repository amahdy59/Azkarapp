"""Encode the product illustrations to AVIF and WebP.

The Friday card and the Benefits card shipped 1254x1254 PNGs at roughly 1.7 MB
each -- 3.3 MB of a 5.8 MB precache, for two decorative images that render at a
few hundred CSS pixels. Same pixels, better codec: no resize, no recrop, so the
artwork itself is untouched (DEC-072).

Sources live beside the background masters in source-assets/images/. Run from
the repository root:

    python design-sources/azkar-responsive-assets/tools/export_product_images.py

Quality is deliberately high. These are reviewed artwork, and the win comes from
the codec rather than from discarding detail.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

PACKAGE_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PACKAGE_ROOT / "source-assets" / "images"
REPO_ROOT = Path(__file__).resolve().parents[3]
OUTPUT_ROOT = REPO_ROOT / "public" / "images"

IMAGES = ("mosque_prophet", "benefits_zikr")

# AVIF carries fine detail at a lower quality number than WebP does; both were
# checked against the source rather than chosen from a table.
AVIF_QUALITY = 62
WEBP_QUALITY = 82


def export(name: str) -> None:
    source = SOURCE_ROOT / f"{name}.png"
    if not source.exists():
        raise SystemExit(f"missing source: {source}")

    with Image.open(source) as image:
        image = image.convert("RGB")
        OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

        avif_path = OUTPUT_ROOT / f"{name}.avif"
        webp_path = OUTPUT_ROOT / f"{name}.webp"
        image.save(avif_path, format="AVIF", quality=AVIF_QUALITY)
        image.save(webp_path, format="WEBP", quality=WEBP_QUALITY, method=6)

    original = source.stat().st_size
    for path in (avif_path, webp_path):
        size = path.stat().st_size
        print(f"  {path.name:<26} {size / 1024:7.1f} KB  ({size / original:.1%} of source PNG)")


def main() -> None:
    for name in IMAGES:
        print(name)
        export(name)


if __name__ == "__main__":
    main()
