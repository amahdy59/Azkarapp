export type AzkarBackgroundKey = "morning" | "evening" | "sleep" | "friday" | "prayer";

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
    objectPositionCompact: "28% 72%",
    objectPositionWide: "40% 70%",
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
    objectPositionCompact: "72% 74%",
    objectPositionWide: "58% 72%",
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
    objectPositionCompact: "25% 74%",
    objectPositionWide: "42% 72%",
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
  friday: {
    alt: "",
    decorative: true,
    objectPositionCompact: "22% 60%",
    objectPositionWide: "42% 60%",
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
    objectPositionCompact: "72% 74%",
    objectPositionWide: "58% 72%",
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
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return items.map(({ src, width }) => `${cleanBase}${src} ${width}w`).join(", ");
}
