import { Modal } from "./ResponsiveSheet";
import { TrackingCheckMark } from "./PrayerTrackerCards";
import { Building, BookOpen, Translate } from "./icons";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type { DailyPathStatus } from "../dailyPath";
import type { AppLanguage } from "../types";

/**
 * What today's path holds, and what is left of it.
 *
 * Opened from the streak and palm indicators rather than living on Home: the
 * detail belongs one press away, and Home already has to carry the prayer, the
 * timed collections and the reminder that is relevant now.
 *
 * The copy never says a day was failed or lost. A pillar is complete or it is
 * not yet, and what is already done stays done — the app is counting practices
 * someone chose, not scoring them.
 */
function Pillar({
  icon,
  title,
  detail,
  complete,
  inactive,
  onGlass = false,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  complete: boolean;
  inactive?: boolean;
  onGlass?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-3.5 ${
        complete
          ? onGlass
            ? "border-white/20 bg-white/15 text-white"
            : "border-primary/50 bg-primary/[0.06]"
          : onGlass
            ? "border-white/20 bg-white/10 text-white"
            : "border-border bg-card"
      } ${inactive ? "opacity-70" : ""}`}
      data-testid={`path-pillar-${title}`}
    >
      {/* State is carried by the mark, the text and the accessible name — never
          by colour alone. */}
      <TrackingCheckMark checked={complete} onGlass={onGlass} />
      <div className="min-w-0 flex-1">
        <p className={`text-subtitle font-black ${onGlass ? "text-white" : "text-foreground"}`}>{title}</p>
        <p className={`mt-0.5 text-label font-semibold ${onGlass ? "text-white/80" : "text-muted-foreground"}`}>
          {detail}
        </p>
      </div>
      <span
        aria-hidden="true"
        className={`flex size-11 shrink-0 items-center justify-center rounded-full border ${
          complete
            ? onGlass
              ? "border-white/20 bg-white/15 text-white"
              : "border-primary/50 bg-primary/15 text-primary"
            : onGlass
              ? "border-white/20 bg-white/10 text-white/80"
              : "border-border bg-muted/40 text-muted-foreground"
        }`}
      >
        {icon}
      </span>
    </div>
  );
}

export function TodaysPathSheet({
  open,
  status,
  language,
  direction,
  mosquePrayerGoal,
  onMosquePrayerGoalChange,
  onViewProgress,
  onClose,
  onGlass = false,
}: {
  open: boolean;
  status: DailyPathStatus;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  mosquePrayerGoal?: number;
  onMosquePrayerGoalChange: (goal: number | undefined) => void;
  onViewProgress?: () => void;
  onClose: () => void;
  onGlass?: boolean;
}) {
  if (!open) return null;
  const count = (value: number) => formatNumerals(value, language);

  return (
    <Modal
      open
      onClose={onClose}
      title={t(language, "dailyPath.title")}
      direction={direction}
      testId="todays-path-sheet"
      maxWidthClassName="max-w-[34rem]"
      onGlass={onGlass}
    >
      <div className="flex flex-col gap-3 px-5 py-4">
        <Pillar
          icon={<Building size={20} />}
          title={t(language, "dailyPath.prayer")}
          detail={t(language, "dailyPath.prayerSummary", {
            recorded: count(status.salah.recordedCount),
            congregation: count(status.salah.mosqueCount),
          })}
          complete={status.salah.recordedCount === 5}
          onGlass={onGlass}
        />

        <Pillar
          icon={<BookOpen size={20} />}
          title={t(language, "dailyPath.quran")}
          detail={
            status.quran.active
              ? t(language, "dailyPath.pages", { read: count(status.quran.progress), goal: count(status.quran.goal) })
              : t(language, "dailyPath.noGoalYet")
          }
          complete={status.quran.complete}
          inactive={!status.quran.active}
          onGlass={onGlass}
        />

        <Pillar
          icon={<Translate size={20} />}
          title={t(language, "dailyPath.dhikr")}
          detail={t(language, "dailyPath.ofThree", { done: count(status.dhikr.completedCount) })}
          complete={status.dhikr.fullComplete}
          onGlass={onGlass}
        />

        <details
          className={`rounded-2xl border ${onGlass ? "border-white/20 bg-white/10 text-white" : "border-border bg-card"}`}
        >
          <summary className="min-h-11 cursor-pointer px-3.5 py-3 text-label font-black focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
            {t(language, "dailyPath.adjustCongregationGoal")}
          </summary>
          <fieldset className={`border-t p-3.5 ${onGlass ? "border-white/20" : "border-border"}`}>
            <legend className="sr-only">{t(language, "dailyPath.mosqueGoal")}</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t(language, "dailyPath.mosqueGoal")}>
              {[1, 2, 3, 4, 5].map((goal) => {
                const selected = mosquePrayerGoal === goal;
                return (
                  <button
                    key={goal}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    data-testid={`mosque-goal-${goal}`}
                    onClick={() => onMosquePrayerGoalChange(selected ? undefined : goal)}
                    className={`flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 text-label font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                      selected
                        ? onGlass
                          ? "border-primary bg-primary/20 text-on-media-accent"
                          : "border-primary bg-primary/15 text-primary"
                        : onGlass
                          ? "border-white/20 text-white hover:bg-white/15"
                          : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {count(goal)}
                  </button>
                );
              })}
            </div>
            <p
              className={`mt-2 text-xs font-semibold leading-5 ${onGlass ? "text-white/80" : "text-muted-foreground"}`}
            >
              {t(language, "dailyPath.mosqueGoalHint")}
            </p>
          </fieldset>
        </details>

        <p
          className={`text-xs font-semibold leading-5 ${onGlass ? "text-white/80" : "text-muted-foreground"}`}
          data-testid="todays-path-summary"
        >
          {t(language, "dailyPath.recordingNote")}
        </p>

        {onViewProgress && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewProgress();
            }}
            className="min-h-11 rounded-xl bg-primary px-4 py-2.5 text-label font-black text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t(language, "dailyPath.viewProgress")}
          </button>
        )}
      </div>
    </Modal>
  );
}
