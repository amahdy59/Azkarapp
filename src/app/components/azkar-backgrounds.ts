export type AzkarBackgroundKey = "morning" | "evening" | "sleep" | "friday_morning" | "friday" | "prayer";

export interface ResponsiveBackgroundAsset {
  alt: "";
  decorative: true;
  objectPositionCompact: string;
  objectPositionWide: string;
  sizes: string;
  placeholder: string;
  avif: readonly { src: string; width: number }[];
  webp: readonly { src: string; width: number }[];
}

export const azkarBackgrounds: Record<AzkarBackgroundKey, ResponsiveBackgroundAsset> = {
  morning: {
    alt: "",
    decorative: true,
    objectPositionCompact: "50% 72%",
    objectPositionWide: "50% 70%",
    sizes: "(max-width: 767px) 100vw, (max-width: 1199px) 66vw, 760px",
    avif: [
      {
        src: "/assets/backgrounds/morning/morning-768.avif",
        width: 768,
      },
      {
        src: "/assets/backgrounds/morning/morning-1280.avif",
        width: 1280,
      },
      {
        src: "/assets/backgrounds/morning/morning-1600.avif",
        width: 1600,
      },
    ],
    webp: [
      {
        src: "/assets/backgrounds/morning/morning-768.webp",
        width: 768,
      },
      {
        src: "/assets/backgrounds/morning/morning-1280.webp",
        width: 1280,
      },
      {
        src: "/assets/backgrounds/morning/morning-1600.webp",
        width: 1600,
      },
    ],
    placeholder: "/assets/backgrounds/morning/morning-placeholder.webp",
  },
  evening: {
    alt: "",
    decorative: true,
    objectPositionCompact: "50% 74%",
    objectPositionWide: "50% 72%",
    sizes: "(max-width: 767px) 100vw, (max-width: 1199px) 66vw, 760px",
    avif: [
      {
        src: "/assets/backgrounds/evening/evening-768.avif",
        width: 768,
      },
      {
        src: "/assets/backgrounds/evening/evening-1280.avif",
        width: 1280,
      },
      {
        src: "/assets/backgrounds/evening/evening-1600.avif",
        width: 1600,
      },
    ],
    webp: [
      {
        src: "/assets/backgrounds/evening/evening-768.webp",
        width: 768,
      },
      {
        src: "/assets/backgrounds/evening/evening-1280.webp",
        width: 1280,
      },
      {
        src: "/assets/backgrounds/evening/evening-1600.webp",
        width: 1600,
      },
    ],
    placeholder: "/assets/backgrounds/evening/evening-placeholder.webp",
  },
  sleep: {
    alt: "",
    decorative: true,
    objectPositionCompact: "50% 74%",
    objectPositionWide: "50% 72%",
    sizes: "(max-width: 767px) 100vw, (max-width: 1199px) 66vw, 760px",
    avif: [
      {
        src: "/assets/backgrounds/sleep/sleep-768.avif",
        width: 768,
      },
      {
        src: "/assets/backgrounds/sleep/sleep-1280.avif",
        width: 1280,
      },
      {
        src: "/assets/backgrounds/sleep/sleep-1600.avif",
        width: 1600,
      },
    ],
    webp: [
      {
        src: "/assets/backgrounds/sleep/sleep-768.webp",
        width: 768,
      },
      {
        src: "/assets/backgrounds/sleep/sleep-1280.webp",
        width: 1280,
      },
      {
        src: "/assets/backgrounds/sleep/sleep-1600.webp",
        width: 1600,
      },
    ],
    placeholder: "/assets/backgrounds/sleep/sleep-placeholder.webp",
  },
  friday_morning: {
    alt: "",
    decorative: true,
    objectPositionCompact: "50% 65%",
    objectPositionWide: "50% 60%",
    sizes: "(max-width: 767px) 100vw, (max-width: 1199px) 66vw, 760px",
    avif: [
      { src: "/assets/backgrounds/friday-morning/friday-morning-768.avif", width: 768 },
      { src: "/assets/backgrounds/friday-morning/friday-morning-1280.avif", width: 1280 },
      { src: "/assets/backgrounds/friday-morning/friday-morning-1600.avif", width: 1600 },
    ],
    webp: [
      { src: "/assets/backgrounds/friday-morning/friday-morning-768.webp", width: 768 },
      { src: "/assets/backgrounds/friday-morning/friday-morning-1280.webp", width: 1280 },
      { src: "/assets/backgrounds/friday-morning/friday-morning-1600.webp", width: 1600 },
    ],
    placeholder: "/assets/backgrounds/friday-morning/friday-morning-placeholder.webp",
  },
  friday: {
    alt: "",
    decorative: true,
    objectPositionCompact: "50% 60%",
    objectPositionWide: "50% 60%",
    sizes: "(max-width: 767px) 100vw, (max-width: 1199px) 66vw, 760px",
    avif: [
      {
        src: "/assets/backgrounds/friday/friday-768.avif",
        width: 768,
      },
      {
        src: "/assets/backgrounds/friday/friday-1280.avif",
        width: 1280,
      },
      {
        src: "/assets/backgrounds/friday/friday-1600.avif",
        width: 1600,
      },
    ],
    webp: [
      {
        src: "/assets/backgrounds/friday/friday-768.webp",
        width: 768,
      },
      {
        src: "/assets/backgrounds/friday/friday-1280.webp",
        width: 1280,
      },
      {
        src: "/assets/backgrounds/friday/friday-1600.webp",
        width: 1600,
      },
    ],
    placeholder: "/assets/backgrounds/friday/friday-placeholder.webp",
  },
  prayer: {
    alt: "",
    decorative: true,
    // Slightly higher crop than evening to show more sky — peaceful post-prayer feel
    objectPositionCompact: "50% 74%",
    objectPositionWide: "50% 72%",
    sizes: "(max-width: 767px) 100vw, (max-width: 1199px) 66vw, 760px",
    avif: [
      {
        src: "/assets/backgrounds/evening/evening-768.avif",
        width: 768,
      },
      {
        src: "/assets/backgrounds/evening/evening-1280.avif",
        width: 1280,
      },
      {
        src: "/assets/backgrounds/evening/evening-1600.avif",
        width: 1600,
      },
    ],
    webp: [
      {
        src: "/assets/backgrounds/evening/evening-768.webp",
        width: 768,
      },
      {
        src: "/assets/backgrounds/evening/evening-1280.webp",
        width: 1280,
      },
      {
        src: "/assets/backgrounds/evening/evening-1600.webp",
        width: 1600,
      },
    ],
    placeholder: "/assets/backgrounds/evening/evening-placeholder.webp",
  },
} as const;

export function toSrcSet(items: readonly { src: string; width: number }[]): string {
  return items.map(({ src, width }) => `${backgroundAssetUrl(src)} ${width}w`).join(", ");
}

export function backgroundAssetUrl(path: string): string {
  if (import.meta.env.MODE === "github-pages") {
    return `https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/visuals/home/2026-10-16${path}`;
  }
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${cleanBase}${path}`;
}
