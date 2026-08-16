from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

PACKAGE_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PACKAGE_ROOT / "source-assets" / "backgrounds"
OUTPUT_ROOT = PACKAGE_ROOT / "public" / "assets" / "backgrounds"

VARIANTS = (
    (768, 432),
    (1280, 720),
    (1600, 900),
)

FOCAL_POINTS = {
    "morning": (0.43, 0.58),
    "evening": (0.52, 0.55),
    "sleep": (0.46, 0.50),
    "friday": (0.55, 0.55),
}

for name, centering in FOCAL_POINTS.items():
    source = SOURCE_ROOT / f"{name}-master.png"
    destination = OUTPUT_ROOT / name
    destination.mkdir(parents=True, exist_ok=True)

    image = Image.open(source).convert("RGB")
    for width, height in VARIANTS:
        output = ImageOps.fit(
            image,
            (width, height),
            method=Image.Resampling.LANCZOS,
            centering=centering,
        ).filter(ImageFilter.UnsharpMask(radius=0.6, percent=45, threshold=3))

        output.save(
            destination / f"{name}-{width}.avif",
            format="AVIF",
            quality=50,
            speed=6,
        )
        output.save(
            destination / f"{name}-{width}.webp",
            format="WEBP",
            quality=75,
            method=6,
        )

    placeholder = ImageOps.fit(
        image,
        (48, 27),
        method=Image.Resampling.LANCZOS,
        centering=centering,
    ).filter(ImageFilter.GaussianBlur(radius=1.1))
    placeholder.save(
        destination / f"{name}-placeholder.webp",
        format="WEBP",
        quality=35,
        method=6,
    )

print("Export complete.")
