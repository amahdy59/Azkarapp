/**
 * Leaf and palm marks for the garden.
 *
 * Split out of RoutineGarden.tsx (was 672 lines) behind the characterization
 * tests added in DEC-038. These are pure presentational SVG with no data
 * dependencies, which is why they were the safest seam to cut first.
 */

export function GoldenLeafMark({
  filled = true,
  className = "",
  size = 24,
}: {
  filled?: boolean;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M20.5 3.5C12.8 3.7 6.4 6.5 4.1 11.3c-1.5 3.1-.5 6.3 2.3 7.4 2.8 1.2 5.9-.2 7.8-2.4 2.7-3.6 4.7-8 6.3-12.8Z"
        fill="var(--garden-leaf)"
        fillOpacity={filled ? 0.95 : 0.22}
        stroke="var(--garden-leaf-edge)"
        strokeOpacity={filled ? 1 : 0.45}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4 20c2.7-4.3 6.5-7.7 11.7-10.1"
        stroke="var(--garden-leaf-vein)"
        strokeOpacity={filled ? 1 : 0.35}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Green Leaf Mark — earned for completing any non-core azkar group (after prayer, food, travel, etc.). */
export function GreenLeafMark({
  filled = true,
  className = "",
  size = 24,
}: {
  filled?: boolean;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M20.5 3.5C12.8 3.7 6.4 6.5 4.1 11.3c-1.5 3.1-.5 6.3 2.3 7.4 2.8 1.2 5.9-.2 7.8-2.4 2.7-3.6 4.7-8 6.3-12.8Z"
        fill="var(--garden-palm)"
        fillOpacity={filled ? 0.95 : 0.22}
        stroke="var(--garden-palm-edge)"
        strokeOpacity={filled ? 1 : 0.45}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4 20c2.7-4.3 6.5-7.7 11.7-10.1"
        stroke="var(--garden-palm-shade)"
        strokeOpacity={filled ? 1 : 0.35}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LeafMark({
  filled = true,
  className = "",
  size = 24,
}: {
  filled?: boolean;
  className?: string;
  size?: number;
}) {
  return <GoldenLeafMark filled={filled} className={className} size={size} />;
}

export function PaleLeafMark({ className = "", size = 20 }: { className?: string; size?: number }) {
  return <GreenLeafMark filled className={className} size={size} />;
}

export function BudMark({ className = "", size = 14 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 14 14"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 13 C7 9.5 4.5 7 4.5 5 C4.5 3.3 5.6 2 7 2 C8.4 2 9.5 3.3 9.5 5 C9.5 7 7 9.5 7 13Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Single unified Palm Tree vector matching public/palm tree.svg across the app. */
export function PalmTreeMark({
  filled = true,
  className = "",
  size = 32,
  color,
  strokeWidth = 2,
}: {
  filled?: boolean;
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 56 53"
      width={size}
      height={size}
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${!filled && !color ? "opacity-40" : ""}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22.335 14.3339H11.6675L9.00064 11.6671L6.33376 14.3339H1C1 6.97358 7.56053 1 15.6678 1C23.7752 1 30.3357 6.97358 30.3357 14.3339C31.6691 19.6675 38.3363 37.0015 33.0026 51.6688H22.335C24.5486 46.3352 26.3354 41.0017 25.0019 34.3347M30.3357 12.0408C33.0362 10.0443 36.3114 8.9776 39.6698 9.0007C47.7771 9.0007 54.3376 14.9743 54.3376 22.3346H46.337L43.6701 19.6678L41.0032 22.3346H33.0026M11.3744 18.8953C5.64061 24.6289 5.24058 33.4826 10.441 38.7095L21.7486 27.3757L31.1627 17.9619C25.9622 12.7351 17.1082 13.1617 11.3744 18.8953Z" />
    </svg>
  );
}

/** Golden Palm Tree Mark — matching golden amber (--garden-gold). */
export function GoldenPalmMark({
  className = "",
  size = 28,
  color = "var(--garden-gold)",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return <PalmTreeMark size={size} color={color} className={className} />;
}

export function PalmMark({ className = "", size = 32 }: { className?: string; size?: number }) {
  return <PalmTreeMark className={className} size={size} />;
}
