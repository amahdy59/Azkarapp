import { memo } from "react";
import type { PrayerName } from "../types";

/**
 * The sky each prayer is called in.
 *
 * Composed rather than drawn as one picture, because a picture has an aspect
 * ratio and this box does not: the hero is 343×150 on a phone and 700×208 on a
 * desk. The first version was a single 400×200 viewBox scaled to cover, which
 * at desktop width blew the skyline up two and a half times — the domes filled
 * the card as brown smears with no sky above them.
 *
 * The light keeps to the trailing band of the card, because the prayer and its
 * time are set against the leading edge and a crescent behind a numeral is a
 * decoration fighting the one thing the card exists to say. How high it sits is
 * what carries the hour instead.
 *
 * So each part is placed by the thing it can't distort in: the sky is a CSS
 * gradient, the sun or crescent is a fixed-size element positioned as a
 * percentage, the stars are dots, and only the skyline is SVG — a band along
 * the bottom edge, which is the one shape that survives being sliced because
 * it is wider than it is tall by design.
 */
export interface PrayerScenePalette {
  horizon: string;
  zenith: string;
  light: string;
  glow: string;
  silhouette: string;
  /** Where the light sits, as a percentage of the scene. */
  lightY: number;
  lightX: number;
  shape: "crescent" | "disc";
  stars: number;
}

const SCENES: Record<PrayerName, PrayerScenePalette> = {
  /* First light: the horizon warms while the sky above is still night, and the
     last stars have not gone out. */
  fajr: {
    horizon: "#8a6038",
    zenith: "#0a1228",
    light: "#f7e3bb",
    glow: "#c9853f",
    silhouette: "#050a18",
    lightY: 58,
    lightX: 72,
    shape: "crescent",
    stars: 4,
  },
  /* Noon, in a sky deep enough to read light text against. */
  dhuhr: {
    horizon: "#4a7ba4",
    zenith: "#0d1b33",
    light: "#ffe9b4",
    glow: "#e8b95e",
    silhouette: "#050d1c",
    lightY: 24,
    lightX: 66,
    shape: "disc",
    stars: 0,
  },
  /* Afternoon: the light has moved on and gone amber. */
  asr: {
    horizon: "#9a7647",
    zenith: "#122340",
    light: "#ffdd97",
    glow: "#d99a4e",
    silhouette: "#060e1e",
    lightY: 38,
    lightX: 78,
    shape: "disc",
    stars: 0,
  },
  /* Sunset: the disc low on the skyline, violet gathering above it. */
  maghrib: {
    horizon: "#bd6a3c",
    zenith: "#1b1a3d",
    light: "#ffc978",
    glow: "#e07a3c",
    silhouette: "#080a1c",
    lightY: 62,
    lightX: 84,
    shape: "disc",
    stars: 2,
  },
  /* Night. */
  isha: {
    horizon: "#1d2f5c",
    zenith: "#070d20",
    light: "#f5e2b0",
    glow: "#c9a24a",
    silhouette: "#04081a",
    lightY: 28,
    lightX: 70,
    shape: "crescent",
    stars: 8,
  },
};

/**
 * The skyline, as a band 1200 wide and 200 tall.
 *
 * Anchored to the bottom edge and sliced horizontally, so a wider card shows
 * more of the city and a narrower one shows its middle — at the same scale
 * either way. A central dome with its finial, two lesser domes, and three
 * minarets.
 */
const SKYLINE =
  "M0,200 L0,168 C60,166 108,158 150,146 L150,92 L162,92 L162,142 C186,152 214,158 246,161 " +
  "C250,120 274,96 312,86 L312,44 L324,44 L324,85 C360,94 384,120 388,160 " +
  "C424,157 456,150 484,140 C488,86 520,44 566,28 L566,8 L578,8 L578,27 " +
  "C628,42 662,86 666,142 C700,152 736,158 772,161 C776,120 800,96 838,86 " +
  "L838,44 L850,44 L850,85 C886,94 910,120 914,160 C954,157 992,150 1026,140 " +
  "C1030,104 1054,80 1086,72 L1086,36 L1096,36 L1096,71 C1130,80 1152,106 1156,150 " +
  "C1172,155 1186,158 1200,160 L1200,200 Z";

/** Fixed positions, so the stars do not move between renders of one prayer. */
const STAR_FIELD = [
  { x: 12, y: 22, r: 1.6 },
  { x: 27, y: 44, r: 1.1 },
  { x: 41, y: 16, r: 1.4 },
  { x: 58, y: 34, r: 1 },
  { x: 69, y: 20, r: 1.5 },
  { x: 82, y: 46, r: 1.1 },
  { x: 91, y: 26, r: 1.3 },
  { x: 48, y: 56, r: 0.9 },
];

export const PrayerSceneArt = memo(function PrayerSceneArt({
  prayer,
  className = "",
}: {
  prayer: PrayerName;
  className?: string;
}) {
  const scene = SCENES[prayer];

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ background: `linear-gradient(to top, ${scene.horizon} 0%, ${scene.zenith} 62%)` }}
      aria-hidden="true"
      data-testid="prayer-scene"
      data-prayer-scene={prayer}
    >
      {STAR_FIELD.slice(0, scene.stars).map((star) => (
        <span
          key={`${star.x}-${star.y}`}
          className="absolute rounded-full"
          style={{
            background: "#f6efdc",
            insetInlineStart: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.r * 2}px`,
            height: `${star.r * 2}px`,
            opacity: 0.75,
          }}
        />
      ))}

      {/* The glow is a soft ellipse behind the light, sized in the box rather
          than in a viewBox, so it stays a halo instead of becoming a wash. */}
      <span
        className="absolute rounded-full"
        style={{
          insetInlineStart: `${scene.lightX}%`,
          top: `${scene.lightY}%`,
          width: "9rem",
          height: "9rem",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${scene.glow}66 0%, transparent 70%)`,
        }}
      />

      {/* A crescent is one disc with another cut out of it by an offset shadow,
          which keeps its shape at every size without a mask to scale. */}
      <span
        className="absolute rounded-full"
        style={{
          insetInlineStart: `${scene.lightX}%`,
          top: `${scene.lightY}%`,
          width: "1.75rem",
          height: "1.75rem",
          transform: "translate(-50%, -50%)",
          background: scene.shape === "crescent" ? "transparent" : scene.light,
          boxShadow: scene.shape === "crescent" ? `inset -0.45rem 0.2rem 0 0 ${scene.light}` : "none",
        }}
      />

      {/* `meet`, not `slice`: covering the band means the height drives the
          scale whenever the card is narrower than the drawing is wide, which
          on a 363px hero zoomed one dome to fill the card. Fitting means the
          city always spans the full width at its own proportion, sitting on
          the bottom edge — a skyline is a band, and a band should never be
          cropped to a fragment of itself. */}
      <svg
        className="absolute inset-x-0 bottom-0 h-full w-full"
        viewBox="0 0 1200 200"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden="true"
        focusable="false"
      >
        <path d={SKYLINE} fill={scene.silhouette} />
      </svg>
    </div>
  );
});

export default PrayerSceneArt;
