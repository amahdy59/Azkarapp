export function CatIcon({ type, size = 22, color = "var(--primary)" }: { type: string; size?: number; color?: string }) {
  if (type === "sun") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3.8" fill={color} />
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <line key={i}
          x1={12 + 6 * Math.cos(deg * Math.PI / 180)} y1={12 + 6 * Math.sin(deg * Math.PI / 180)}
          x2={12 + 8.8 * Math.cos(deg * Math.PI / 180)} y2={12 + 8.8 * Math.sin(deg * Math.PI / 180)}
          stroke={color} strokeWidth="1.8" strokeLinecap="round"
        />
      ))}
    </svg>
  );
  if (type === "crescent") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20.4 13.4A8.4 8.4 0 1 1 10.6 3.6 6.5 6.5 0 0 0 20.4 13.4z" fill={color} />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5"  r="1.4" fill={color} />
      <circle cx="6"  cy="9"  r="1.2" fill={color} opacity=".7" />
      <circle cx="18" cy="9"  r="1.2" fill={color} opacity=".7" />
      <circle cx="8"  cy="15" r="1.4" fill={color} />
      <circle cx="16" cy="15" r="1.4" fill={color} />
      <circle cx="12" cy="19" r="1.2" fill={color} opacity=".7" />
      <circle cx="12" cy="11" r="2.4" fill={color} />
    </svg>
  );
}
