import type { AppLanguage } from "../types";
import { formatNumerals } from "../formatting";

/** Noninteractive chart primitive. Values and labels accompany color; segments
 * must be nonoverlapping parts of max, supplied by a domain selector. */
export function RecordedComparisonBar({
  segments,
  max,
  language,
  label,
}: {
  segments: readonly { label: string; value: number; color: string }[];
  max: number;
  language: AppLanguage;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div
        role="img"
        aria-label={label}
        className="flex h-3 overflow-hidden rounded-full bg-muted"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        {segments.map((segment) => (
          <span
            key={segment.label}
            style={{
              ...(segments.length > 1
                ? { flex: `${segment.value} 1 0%` }
                : { width: `${max > 0 ? (segment.value / max) * 100 : 0}%` }),
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>
      {segments.length > 1 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {segments.map((segment) => (
            <li key={segment.label} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span>
                {segment.label}:{" "}
                <bdi className="font-bold text-foreground">{formatNumerals(segment.value, language)}</bdi>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
