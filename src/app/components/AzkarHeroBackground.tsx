import { useState, type CSSProperties } from "react";
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
  const [failed, setFailed] = useState(false);
  const style = {
    "--azkar-bg-placeholder": `url(${getAssetUrl(asset.placeholder)})`,
    "--azkar-bg-position": asset.objectPositionCompact,
    "--azkar-bg-position-wide": asset.objectPositionWide,
  } as CSSProperties;

  if (failed) {
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
        src={getAssetUrl(asset.webp[1]?.src || asset.webp[0]?.src || "")}
        alt=""
        aria-hidden="true"
        width={1280}
        height={720}
        loading={priority ? "eager" : "lazy"}
        {...{ fetchpriority: priority ? "high" : "auto" }}
        decoding="async"
        onError={() => setFailed(true)}
      />
    </picture>
  );
}
