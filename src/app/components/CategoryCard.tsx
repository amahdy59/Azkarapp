import { CatIcon } from "./CatIcon";
import { Check } from "./icons";
import { ProgressBar } from "./ProgressBar";

export interface CategoryCardProps {
  id: string;
  title: string;
  icon: string;
  direction: "ltr" | "rtl";
  isOccasional?: boolean;
  totalCount: number;
  completedCount?: number;
  routineSummary?: string;
  progressText?: string;
  occasionalSubtitle?: string;
  ariaLabel: string;
  onClick: () => void;
  index?: number;
}

export function CategoryCard({
  id,
  title,
  icon,
  direction,
  isOccasional,
  totalCount,
  completedCount = 0,
  routineSummary,
  progressText,
  occasionalSubtitle,
  ariaLabel,
  onClick,
  index,
}: CategoryCardProps) {
  const isComplete = completedCount >= totalCount && totalCount > 0;
  const isStarted = completedCount > 0;

  return (
    <button
      type="button"
      data-testid={`category-card-${id}`}
      dir={direction}
      onClick={onClick}
      style={index !== undefined ? { animationDelay: `${index * 45}ms` } : undefined}
      className={`interactive-elem flex min-h-[82px] w-full items-center gap-4 rounded-3xl border border-border/40 bg-card p-4.5 text-start shadow-raised hover:border-primary/40 hover:shadow-overlay transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${index !== undefined ? "stagger-enter" : ""}`}
      aria-label={ariaLabel}
    >
      <span
        data-slot="category-icon"
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10"
        aria-hidden="true"
      >
        <CatIcon type={icon} size={24} color="var(--primary)" />
      </span>
      <span data-slot="category-copy" className="min-w-0 flex-1">
        <span className="block text-[1rem] font-bold text-foreground">{title}</span>
        {isOccasional ? (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[0.8125rem] font-semibold text-muted-foreground">{occasionalSubtitle}</span>
          </div>
        ) : (
          <div className="mt-2 flex flex-col gap-1">
            {isStarted && !isComplete && (
              <ProgressBar
                value={completedCount}
                max={totalCount}
                height={5}
                trackColor="var(--muted)"
                fillColor="var(--primary)"
                direction={direction}
                aria-label={progressText || ""}
              />
            )}
            <span className="flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground">
              {/* A shape, not just the chevron's hue, marks a finished
                  collection — colour alone is not a sufficient cue. */}
              {isComplete && <Check size={15} className="shrink-0 text-primary" aria-hidden="true" />}
              {/* Each phrase is its own bidi isolate. Both end and begin with
                  numerals, and in an RTL run the algorithm reordered them
                  across the separator: "٢٥ ذكرًا · ٠ من ٢٥" rendered as
                  "٢٥٠ ذكرًا ٢٥٠", which reads as a wrong total. <bdi> is
                  exactly the element for this. */}
              <span>
                {routineSummary ? (
                  <>
                    <bdi>{routineSummary}</bdi>
                    <span aria-hidden="true"> · </span>
                  </>
                ) : null}
                <bdi>{progressText}</bdi>
              </span>
            </span>
          </div>
        )}
      </span>
    </button>
  );
}
