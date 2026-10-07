import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { azkarBackgrounds, toSrcSet, type AzkarBackgroundKey } from "./azkar-backgrounds";
import "./azkar-hero-background.css";

const getAssetUrl = (path: string) => {
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${cleanBase}${path}`;
};

interface AzkarHeroBackgroundProps {
  kind: AzkarBackgroundKey;
  priority?: boolean;
  className?: string;
}

export function AzkarHeroBackground({ kind, priority = false, className = "" }: AzkarHeroBackgroundProps) {
  const asset = azkarBackgrounds[kind];
  // If the photograph cannot be fetched — offline before it was cached, a
  // blocked request, a corrupt file — the hero must still be a dark ground,
  // because everything drawn on it is light-on-media text. Falling back to
  // nothing would leave white text on the page background.
  const [failedKind, setFailedKind] = useState<AzkarBackgroundKey | null>(null);
  const [decodedKind, setDecodedKind] = useState<AzkarBackgroundKey | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const revealDecodedImage = useCallback(
    async (image: HTMLImageElement) => {
      try {
        if (typeof image.decode === "function") await image.decode();
        if (imageRef.current === image && image.naturalWidth > 0) setDecodedKind(kind);
      } catch {
        if (imageRef.current === image) setFailedKind(kind);
      }
    },
    [kind],
  );
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) void revealDecodedImage(image);
  }, [kind, revealDecodedImage]);
  const style = {
    "--azkar-bg-placeholder": `url(${getAssetUrl(asset.placeholder)})`,
    "--azkar-bg-position": asset.objectPositionCompact,
    "--azkar-bg-position-wide": asset.objectPositionWide,
  } as CSSProperties;

  if (failedKind === kind) {
    return (
      <div
        data-testid="azkar-hero-fallback"
        aria-hidden="true"
        className={`azkar-hero__fallback ${className}`.trim()}
      />
    );
  }

  return (
    <picture className={`azkar-hero__media ${className}`.trim()} style={style}>
      <source type="image/avif" srcSet={toSrcSet(asset.avif)} sizes={asset.sizes} />
      <source type="image/webp" srcSet={toSrcSet(asset.webp)} sizes={asset.sizes} />
      <img
        key={kind}
        ref={imageRef}
        src={getAssetUrl(asset.webp[1]?.src || asset.webp[0]?.src || "")}
        alt=""
        aria-hidden="true"
        width={1280}
        height={720}
        loading={priority ? "eager" : "lazy"}
        {...{ fetchpriority: priority ? "high" : "auto" }}
        decoding="async"
        style={{ opacity: decodedKind === kind ? 1 : 0 }}
        onLoad={(event) => void revealDecodedImage(event.currentTarget)}
        onError={() => setFailedKind(kind)}
      />
    </picture>
  );
}
