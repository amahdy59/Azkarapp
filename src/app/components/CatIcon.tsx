import {
  Moon,
  Stars,
  Sun,
  Home,
  Building,
  BookOpen,
  Droplets,
  Coffee,
  Plane,
  Globe,
  User,
  Heart,
  Sparkles,
  AlertTriangle,
} from "./icons";

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
  if (type === "home") return <Home {...sharedProps} />;
  if (type === "building") return <Building {...sharedProps} />;
  if (type === "book-open") return <BookOpen {...sharedProps} />;
  if (type === "droplets") return <Droplets {...sharedProps} />;
  if (type === "coffee") return <Coffee {...sharedProps} />;
  if (type === "plane") return <Plane {...sharedProps} />;
  if (type === "globe") return <Globe {...sharedProps} />;
  if (type === "user") return <User {...sharedProps} />;
  if (type === "heart") return <Heart {...sharedProps} />;
  if (type === "sparkles") return <Sparkles {...sharedProps} />;
  if (type === "alert") return <AlertTriangle {...sharedProps} />;
  return <Stars {...sharedProps} />;
}
