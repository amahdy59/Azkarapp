import { useId } from "react";
import type { AppLanguage } from "../types";

export function QiblaCompassDial({
  rotation,
  northRotation,
  reduceMotion,
  language,
  aligned = false,
  live = false,
}: {
  rotation: number;
  northRotation: number;
  reduceMotion: boolean;
  language: AppLanguage;
  aligned?: boolean;
  live?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const metal = `${id}-metal`,
    face = `${id}-face`,
    needle = `${id}-needle`,
    cap = `${id}-cap`;
  const ticks = Array.from({ length: 72 }, (_, index) => index * 5);
  const cardinalLabels = language === "ar" ? ["شمال", "شرق", "جنوب", "غرب"] : ["N", "E", "S", "W"];
  return (
    <svg viewBox="0 0 320 320" className="qibla-instrument aspect-square w-full" aria-hidden="true">
      <defs>
        <linearGradient id={metal} x1="0" y1="0" x2="0.85" y2="1">
          <stop stopColor="var(--muted-foreground)" />
          <stop offset="0.28" stopColor="var(--card)" />
          <stop offset="0.52" stopColor="var(--muted-foreground)" />
          <stop offset="0.7" stopColor="var(--border)" />
          <stop offset="1" stopColor="var(--muted-foreground)" />
        </linearGradient>
        <radialGradient id={face} cx="38%" cy="28%" r="78%">
          <stop stopColor="var(--card)" />
          <stop offset="1" stopColor="var(--background)" />
        </radialGradient>
        <linearGradient id={needle} x1="0" x2="1">
          <stop stopColor="var(--primary)" />
          <stop offset="0.48" stopColor="var(--primary)" />
          <stop offset="0.5" stopColor="var(--foreground)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
        <radialGradient id={cap} cx="32%" cy="24%">
          <stop stopColor="var(--foreground)" />
          <stop offset="0.4" stopColor="var(--muted-foreground)" />
          <stop offset="0.8" stopColor="var(--card)" />
          <stop offset="1" stopColor="var(--border)" />
        </radialGradient>
      </defs>
      <circle
        className="qibla-bezel"
        cx="160"
        cy="160"
        r="153"
        fill={`url(#${metal})`}
        stroke="var(--border)"
        strokeWidth="0.8"
      />
      <circle cx="160" cy="160" r="148" fill={`url(#${face})`} stroke="var(--muted-foreground)" strokeWidth="0.6" />
      <circle cx="160" cy="160" r="144" fill="none" stroke="var(--border)" strokeWidth="0.5" />
      <circle cx="160" cy="160" r="96" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.5" />
      <path d="M160 78v61m0 42v61M78 160h61m42 0h61" stroke="var(--border)" strokeWidth="0.5" opacity="0.65" />
      <g data-testid="compass-rose" transform={`rotate(${northRotation} 160 160)`}>
        {ticks.map((degrees) => {
          const major = degrees % 30 === 0;
          return (
            <line
              key={degrees}
              x1="160"
              y1="21"
              x2="160"
              y2={major ? 35 : degrees % 10 === 0 ? 30 : 26}
              stroke={major ? "var(--foreground)" : "var(--muted-foreground)"}
              strokeWidth={major ? 1.5 : 0.75}
              transform={`rotate(${degrees} 160 160)`}
            />
          );
        })}
        <g
          fill="var(--foreground)"
          fontFamily="inherit"
          fontSize={language === "ar" ? "12" : "17"}
          fontWeight="600"
          textAnchor="middle"
        >
          <text x="160" y="58" transform={`rotate(${-northRotation} 160 58)`}>
            {cardinalLabels[0]}
          </text>
          <text x="263" y="166" transform={`rotate(${-northRotation} 263 166)`}>
            {cardinalLabels[1]}
          </text>
          <text x="160" y="274" transform={`rotate(${-northRotation} 160 274)`}>
            {cardinalLabels[2]}
          </text>
          <text x="57" y="166" transform={`rotate(${-northRotation} 57 166)`}>
            {cardinalLabels[3]}
          </text>
        </g>
      </g>
      {live && <path data-testid="device-forward" d="M154 8h12l-6 12Z" fill="var(--foreground)" />}
      <g data-testid="qibla-arrow" transform={`rotate(${rotation} 160 160)`}>
        <path d="M160 63 170 160 160 153 150 160Z" fill={`url(#${needle})`} stroke="var(--primary)" strokeWidth="0.6" />
        <path d="M160 246 152 160 160 166 168 160Z" fill="var(--muted-foreground)" opacity="0.65" />
        <path d="M160 70v79" stroke="var(--foreground)" strokeWidth="0.5" opacity="0.55" />
        <g data-testid="kaaba-target" transform={`rotate(${-rotation} 160 43)`}>
          <circle
            cx="160"
            cy="43"
            r="29"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.5"
            opacity={aligned ? 0.72 : 0}
            style={
              reduceMotion
                ? undefined
                : {
                    transition: "opacity 180ms ease-out, transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
                    transformOrigin: "160px 43px",
                    transform: aligned ? "scale(1)" : "scale(0.78)",
                  }
            }
          />
          {/* Shaded architectural faces keep the destination visually distinct from action icons. */}
          <path d="m145 31 19-6 14 7-19 6Z" fill="#33312c" stroke="#777064" strokeWidth="0.5" />
          <path d="m145 31 14 7v22l-14-7Z" fill="#151618" stroke="#4b4943" strokeWidth="0.5" />
          <path d="m159 38 19-6v22l-19 6Z" fill="#242426" stroke="#4b4943" strokeWidth="0.5" />
          <path d="m145 37 14 7 19-6v4l-19 6-14-7Z" fill="#bba46a" />
          <path d="m166 46 5-1.5v10l-5 1.5Z" fill="#bba46a" />
          <path d="m146 32 13 6 18-5" fill="none" stroke="#a99d81" strokeWidth="0.5" opacity="0.65" />
        </g>
      </g>
      <circle cx="160" cy="160" r="8" fill={`url(#${cap})`} stroke="var(--muted-foreground)" strokeWidth="0.6" />
      <circle cx="160" cy="160" r="2" fill="var(--card)" stroke="var(--border)" strokeWidth="0.5" />
    </svg>
  );
}
