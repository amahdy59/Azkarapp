import { Moon, Stars, Sun } from "./icons";

export function CatIcon({
  type,
  size = 22,
  color = "var(--primary)",
}: {
  type: string;
  size?: number;
  color?: string;
}) {
  const sharedProps = { size, color, "aria-hidden": true } as const;

  if (type === "sun") return <Sun {...sharedProps} />;
  if (type === "crescent") return <Moon {...sharedProps} />;
  return <Stars {...sharedProps} />;
}
