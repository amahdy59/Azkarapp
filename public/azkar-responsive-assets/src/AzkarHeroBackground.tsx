import type { CSSProperties } from "react";
import { azkarBackgrounds, toSrcSet, type AzkarBackgroundKey } from "./azkar-backgrounds";
import "./azkar-hero-background.css";

interface AzkarHeroBackgroundProps {
  kind: AzkarBackgroundKey;
  priority?: boolean;
  className?: string;
}

export function AzkarHeroBackground({
  kind,
  priority = false,
  className = "",
}: AzkarHeroBackgroundProps) {
  const asset = azkarBackgrounds[kind];
  const style = {
    "--azkar-bg-placeholder": `url(${asset.placeholder})`,
    "--azkar-bg-position": asset.objectPosition,
  } as CSSProperties;

  return (
    <picture
      className={`azkar-hero__media ${className}`.trim()}
      aria-hidden="true"
      style={style}
    >
      <source type="image/avif" srcSet={toSrcSet(asset.avif)} sizes={asset.sizes} />
      <source type="image/webp" srcSet={toSrcSet(asset.webp)} sizes={asset.sizes} />
      <img
        src={asset.webp[1].src}
        alt=""
        width={1280}
        height={720}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}
