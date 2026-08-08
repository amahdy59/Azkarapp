import type { CSSProperties } from "react";
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
  const style = {
    "--azkar-bg-placeholder": `url(${getAssetUrl(asset.placeholder)})`,
    "--azkar-bg-position": asset.objectPosition,
  } as CSSProperties;

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
      />
    </picture>
  );
}
