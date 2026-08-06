export type AzkarBackgroundKey = "morning" | "evening" | "sleep" | "friday" | "prayer";

export interface ResponsiveBackgroundAsset {
  alt: "";
  decorative: true;
  objectPosition: string;
  sizes: string;
  placeholder: string;
  avif: readonly { src: string; width: number }[];
  webp: readonly { src: string; width: number }[];
}

export const azkarBackgrounds: Record<AzkarBackgroundKey, ResponsiveBackgroundAsset> = {
  morning: {
    alt: "",
    decorative: true,
    objectPosition: "43% 57%",
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
    objectPosition: "52% 55%",
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
    objectPosition: "46% 50%",
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
    objectPosition: "55% 55%",
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
    objectPosition: "52% 40%",
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
