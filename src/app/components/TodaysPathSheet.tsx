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
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  complete: boolean;
  inactive?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-3.5 ${
        complete ? "border-primary/50 bg-primary/[0.06]" : "border-border bg-card"
      } ${inactive ? "opacity-70" : ""}`}
      data-testid={`path-pillar-${title}`}
    >
      {/* State is carried by the mark, the text and the accessible name — never
          by colour alone. */}
      <TrackingCheckMark checked={complete} />
      <div className="min-w-0 flex-1">
        <p className="text-subtitle font-black text-foreground">{title}</p>
        <p className="mt-0.5 text-label font-semibold text-muted-foreground">{detail}</p>
      </div>
      <span
        aria-hidden="true"
        className={`flex size-11 shrink-0 items-center justify-center rounded-full border ${
          complete ? "border-primary/50 bg-primary/15 text-primary" : "border-border bg-muted/40 text-muted-foreground"
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
  onClose,
}: {
  open: boolean;
  status: DailyPathStatus;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  mosquePrayerGoal?: number;
  onMosquePrayerGoalChange: (goal: number | undefined) => void;
  onClose: () => void;
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
    >
      <div className="flex flex-col gap-3 px-5 py-4">
        <Pillar
          icon={<Translate size={20} />}
          title={t(language, "dailyPath.dhikr")}
          detail={t(language, "dailyPath.ofThree", { done: count(status.dhikr.completedCount) })}
          complete={status.dhikr.fullComplete}
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
        />

        <Pillar
          icon={<Building size={20} />}
          title={t(language, "dailyPath.mosque")}
          detail={
            status.salah.configured
              ? t(language, "dailyPath.prayers", {
                  done: count(status.salah.mosqueCount),
                  goal: count(status.salah.target ?? 0),
                })
              : t(language, "dailyPath.noGoalYet")
          }
          complete={status.salah.complete}
          inactive={!status.salah.configured}
        />

        {/* The gentle setup the pillar needs, where the pillar is — rather than
            a setting buried elsewhere that a reader has to be told about. An
            unset goal asks nothing of the day; it is not a target of zero. */}
        <fieldset className="rounded-2xl border border-border bg-card p-3.5">
          <legend className="px-1 text-label font-black text-foreground">{t(language, "dailyPath.mosqueGoal")}</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={t(language, "dailyPath.mosqueGoal")}>
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
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {count(goal)}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-muted-foreground">
            {t(language, "dailyPath.mosqueGoalHint")}
          </p>
        </fieldset>

        {/* Where the day stands, said plainly and without loss language. */}
        <p className="text-label font-bold text-foreground" data-testid="todays-path-summary">
          {status.streakQualified ? t(language, "dailyPath.streakSecured") : t(language, "dailyPath.streakPending")}
        </p>
        <p className="text-label font-semibold text-muted-foreground">
          {status.palmEarned
            ? t(language, "dailyPath.palmEarned")
            : t(language, "dailyPath.palmProgress", {
                done: count(status.achievedPillarCount),
                total: count(status.activePillarCount),
              })}
        </p>
      </div>
    </Modal>
  );
}
