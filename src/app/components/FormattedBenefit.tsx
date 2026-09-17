import React from "react";

interface FormattedBenefitProps {
  text: string;
  isArabic?: boolean;
  direction?: "ltr" | "rtl";
  className?: string;
}

interface BulletItem {
  id: string;
  term?: string;
  definition: string;
}

/**
 * Parses a benefit string into a title and structured bullet points.
 */
export function parseBenefitText(text: string): { title?: string; bullets: BulletItem[] } {
  if (!text || !text.trim()) {
    return { bullets: [] };
  }

  let cleaned = text.trim();
  let title: string | undefined;

  // Split into lines first
  const lines = cleaned
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const [firstLine] = lines;

  if (firstLine !== undefined) {
    const emDashIndex = firstLine.indexOf(" — ");
    const bulletIndex = firstLine.search(/[•-]/);

    if (emDashIndex !== -1 && (bulletIndex === -1 || emDashIndex < bulletIndex)) {
      title = firstLine.substring(0, emDashIndex).trim();
      lines[0] = firstLine.substring(emDashIndex + 3).trim();
    } else if (!firstLine.startsWith("•") && !firstLine.startsWith("-")) {
      if (bulletIndex > 0) {
        title = firstLine.substring(0, bulletIndex).trim();
        lines[0] = firstLine.substring(bulletIndex).trim();
      } else if (lines.length > 1) {
        title = lines.shift();
      }
    }
  }

  cleaned = lines.join("\n");

  // Split remaining text into individual bullet items
  const rawSegments = cleaned
    .split(/\n|•| — /)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const bullets: BulletItem[] = [];

  rawSegments.forEach((segment, idx) => {
    const trimmed = segment.replace(/^[-•\s]+/, "").trim();
    if (!trimmed) return;

    // Check for term: definition pattern
    const colonIdx = trimmed.indexOf(":");
    const arColonIdx = trimmed.indexOf("：");
    const splitIdx = colonIdx !== -1 ? colonIdx : arColonIdx;

    if (splitIdx > 0 && splitIdx < 45) {
      const term = trimmed.substring(0, splitIdx).trim();
      const definition = trimmed.substring(splitIdx + 1).trim();
      bullets.push({
        id: `bullet-${idx}`,
        term,
        definition: definition || term,
      });
    } else {
      bullets.push({
        id: `bullet-${idx}`,
        definition: trimmed,
      });
    }
  });

  if (bullets.length === 0 && title) {
    return { title: undefined, bullets: [{ id: "bullet-0", definition: text.trim() }] };
  }

  return { title, bullets };
}

export function FormattedBenefit({ text, isArabic = true, direction = "rtl", className = "" }: FormattedBenefitProps) {
  const { title, bullets } = parseBenefitText(text);

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-start ${className}`}
      lang={isArabic ? "ar" : "en"}
      dir={direction}
    >
      {title && (
        <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-900 dark:text-amber-200">
            ✨
          </span>
          <h4 className="text-[0.9375rem] font-bold leading-6 text-amber-950 dark:text-amber-100">{title}</h4>
        </div>
      )}

      {bullets.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {bullets.map((item) => (
            <li key={item.id} className="flex items-start gap-2.5 text-[0.9375rem] leading-7">
              <span
                className="mt-2.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400"
                aria-hidden="true"
              />
              <div className="flex-1 text-foreground">
                {item.term ? (
                  <p className="inline">
                    <span className="font-bold text-amber-950 dark:text-amber-200">{item.term}: </span>
                    <span className="font-medium text-foreground/90">{item.definition}</span>
                  </p>
                ) : (
                  <p className="font-medium text-foreground/90">{item.definition}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
