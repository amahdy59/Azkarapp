export function MaleAvatar({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="var(--muted)" />
      <circle cx="20" cy="15" r="7" fill="var(--primary)" opacity=".9" />
      <path d="M6 38c0-7.7 6.3-14 14-14s14 6.3 14 14" fill="var(--primary)" opacity=".6" />
    </svg>
  );
}
