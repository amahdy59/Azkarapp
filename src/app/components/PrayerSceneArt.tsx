import { memo, useId } from "react";
import type { PrayerName } from "../types";

/**
 * The sky each prayer is called in, drawn rather than photographed.
 *
 * Five scenes, one per prayer, sharing a single skyline. They are vector for
 * three reasons: a photograph would be five more responsive asset sets in the
 * precache for a card that is decoration, a drawn sky can hold the same hue in
 * every theme where a photograph cannot, and there is no request to wait for —
 * the scene is present in the first paint of the card rather than arriving
 * after it. `AzkarHeroBackground` still owns the photography on Home; this is
 * a different job at a different size.
 *
 * Every scene is dark enough to carry the light text set over it, which is why
 * Dhuhr's noon is a deep warm blue rather than a bright one: the card is read
 * before it is looked at.
 */
export type PrayerScenePalette = {
  /** Sky, horizon-first: the gradient runs from the skyline upward. */
  horizon: string;
  zenith: string;
  /** The disc or crescent, and the glow around it. */
  light: string;
  glow: string;
  /** The skyline itself, always darker than the sky it stands against. */
  silhouette: string;
  /** How high the light sits, as a fraction of the scene's height. */
  lightY: number;
  /** How far along, so the sun tracks across the day. */
  lightX: number;
  shape: "crescent" | "disc";
  stars: number;
};

const SCENES: Record<PrayerName, PrayerScenePalette> = {
  /* First light: the horizon warms while the sky above is still night, and the
     last stars have not gone out. */
  fajr: {
    horizon: "#7a5a3a",
    zenith: "#0a1228",
    light: "#f2d9a8",
    glow: "#c98f4a",
    silhouette: "#050a18",
    lightY: 0.82,
    lightX: 0.24,
    shape: "crescent",
    stars: 5,
  },
  /* Noon: the sun at its height, in a sky deep enough to read against. */
  dhuhr: {
    horizon: "#3f6d92",
    zenith: "#0d1b33",
    light: "#ffe6a8",
    glow: "#e8b95e",
    silhouette: "#050d1c",
    lightY: 0.22,
    lightX: 0.5,
    shape: "disc",
    stars: 0,
  },
  /* Afternoon: the light has moved on and gone amber. */
  asr: {
    horizon: "#8a6a44",
    zenith: "#122340",
    light: "#ffd98a",
    glow: "#d99a4e",
    silhouette: "#060e1e",
    lightY: 0.42,
    lightX: 0.74,
    shape: "disc",
    stars: 0,
  },
  /* Sunset: the disc on the skyline, the sky going violet above it. */
  maghrib: {
    horizon: "#b5643a",
    zenith: "#1b1a3d",
    light: "#ffc978",
    glow: "#e07a3c",
    silhouette: "#080a1c",
    lightY: 0.76,
    lightX: 0.82,
    shape: "disc",
    stars: 1,
  },
  /* Night, and the crescent the mockup opens on. */
  isha: {
    horizon: "#1a2a52",
    zenith: "#070d20",
    light: "#f5e2b0",
    glow: "#c9a24a",
    silhouette: "#04081a",
    lightY: 0.26,
    lightX: 0.34,
    shape: "crescent",
    stars: 9,
  },
};

/**
 * One skyline for all five, so the hour is the only thing that changes between
 * them: a central dome with its finial, two lesser domes, three minarets, and
 * the ground they stand on. Drawn to a 400×200 box and anchored to the bottom
 * of whatever it is placed in.
 */
const SKYLINE =
  "M0,200 L0,168 C24,166 44,160 62,150 L62,120 L68,120 L68,150 C78,155 88,158 100,160 " +
  "C102,138 112,124 128,118 L128,96 L133,96 L133,117 C150,123 160,138 162,160 " +
  "C176,158 188,153 198,146 C200,112 214,86 236,74 L236,44 L242,44 L242,73 " +
  "C266,85 281,112 283,148 C294,154 306,158 318,160 C320,140 330,127 344,121 " +
  "L344,100 L349,100 L349,121 C363,127 373,140 375,160 C384,163 392,165 400,166 L400,200 Z";

/** Fixed positions, so the stars do not move between renders of one prayer. */
const STAR_FIELD = [
  { x: 40, y: 28, r: 1.6 },
  { x: 96, y: 52, r: 1.1 },
  { x: 148, y: 22, r: 1.4 },
  { x: 206, y: 44, r: 1 },
  { x: 262, y: 26, r: 1.5 },
  { x: 310, y: 58, r: 1.1 },
  { x: 356, y: 32, r: 1.3 },
  { x: 178, y: 68, r: 0.9 },
  { x: 76, y: 86, r: 1 },
];

export const PrayerSceneArt = memo(function PrayerSceneArt({
  prayer,
  className = "",
}: {
  prayer: PrayerName;
  className?: string;
}) {
  const id = useId();
  const scene = SCENES[prayer];
  const skyId = `${id}-sky`;
  const glowId = `${id}-glow`;
  const lightX = scene.lightX * 400;
  const lightY = scene.lightY * 200;

  return (
    <svg
      className={className}
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      data-testid="prayer-scene"
      data-prayer-scene={prayer}
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={scene.horizon} />
          <stop offset="55%" stopColor={scene.zenith} />
          <stop offset="100%" stopColor={scene.zenith} />
        </linearGradient>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor={scene.glow} stopOpacity="0.55" />
          <stop offset="100%" stopColor={scene.glow} stopOpacity="0" />
        </radialGradient>
        {scene.shape === "crescent" && (
          <mask id={`${id}-crescent`}>
            <circle cx={lightX} cy={lightY} r="13" fill="white" />
            <circle cx={lightX + 6} cy={lightY - 4} r="12" fill="black" />
          </mask>
        )}
      </defs>

      <rect width="400" height="200" fill={`url(#${skyId})`} />

      {STAR_FIELD.slice(0, scene.stars).map((star) => (
        <circle key={`${star.x}-${star.y}`} cx={star.x} cy={star.y} r={star.r} fill="#f6efdc" opacity="0.75" />
      ))}

      <circle cx={lightX} cy={lightY} r="58" fill={`url(#${glowId})`} />
      {scene.shape === "crescent" ? (
        <circle cx={lightX} cy={lightY} r="13" fill={scene.light} mask={`url(#${id}-crescent)`} />
      ) : (
        <circle cx={lightX} cy={lightY} r="11" fill={scene.light} />
      )}

      <path d={SKYLINE} fill={scene.silhouette} />
    </svg>
  );
});

export default PrayerSceneArt;
