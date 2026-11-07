import { Modal, SheetHeader } from "./ResponsiveSheet";
import { Zap, ChevronDown, BookOpen, Leaf, Mosque, CheckCircle2, BarChart3 } from "./icons";
import { PathRewardMark } from "./GardenMarks";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type { DailyPathStatus } from "../dailyPath";
import type { AppLanguage } from "../types";

/** Read-only reflection of existing practice records, never a second checklist. */
export function TodaysPathSheet({
  open,
  status,
  palmCount = 0,
  streakCount = 0,
  language,
  direction,
  onViewProgress,
  onClose,
  onGlass = false,
}: {
  open: boolean;
  status: DailyPathStatus;
  palmCount?: number;
  streakCount?: number;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onViewProgress?: () => void;
  onClose: () => void;
  onGlass?: boolean;
}) {
  if (!open) return null;
  const count = (value: number) => formatNumerals(value, language);
  const tier = status.palmTier;
  const rows = [
    {
      title: t(language, "dailyPath.dhikr"),
      detail: t(language, "dailyPath.ofThree", { done: count(status.dhikr.completedCount) }),
      complete: status.dhikr.fullComplete,
      Icon: Leaf,
    },
    {
      title: t(language, "dailyPath.quran"),
      detail: status.quran.active
        ? t(language, "dailyPath.pages", { read: count(status.quran.progress), goal: count(status.quran.goal) })
        : t(language, "dailyPath.noGoalYet"),
      complete: status.quran.complete,
      Icon: BookOpen,
    },
    {
      title: t(language, "dailyPath.mosque"),
      detail: t(language, "dailyPath.mosqueRecorded", { done: count(status.salah.mosqueCount) }),
      complete: status.salah.mosqueCount >= 5,
      Icon: Mosque,
    },
  ];
  return (
    <Modal
      open
      onClose={onClose}
      title={t(language, "dailyPath.title")}
      direction={direction}
      testId="todays-path-sheet"
      maxWidthClassName="max-w-[34rem]"
      onGlass={onGlass}
      showCloseButton={false}
    >
      <SheetHeader
        title={t(language, "dailyPath.title")}
        language={language}
        onClose={onClose}
        className="compact-sheet-header"
      />
      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 py-4">
        <section
          className="paper-surface flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-3"
          aria-label={t(language, "dailyPath.todayReward")}
        >
          <div className="shrink-0">
            <PathRewardMark tier={tier} size={48} />
          </div>
          <div className="min-w-0">
            <p className="text-subtitle font-black">
              {t(
                language,
                tier === "none"
                  ? "dailyPath.growing"
                  : tier === "palm"
                    ? "dailyPath.regularPalm"
                    : tier === "golden"
                      ? "dailyPath.goldenPalm"
                      : "dailyPath.oasisPalm",
              )}
            </p>
            <p className="mt-1 text-label text-muted-foreground">{t(language, "dailyPath.autoTracked")}</p>
          </div>
        </section>

        <dl className="grid gap-2" aria-label={t(language, "dailyPath.recordedToday")}>
          {rows.map(({ Icon, ...row }) => (
            <div
              key={row.title}
              className="paper-surface relative rounded-2xl border border-border bg-card p-3"
              data-testid={"path-pillar-" + row.title}
            >
              <dt className="flex min-w-0 items-center gap-3 ps-11 text-label font-bold">
                <span className="absolute start-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">{row.title}</span>
                {row.complete && <CheckCircle2 size={18} aria-hidden="true" className="shrink-0 text-primary" />}
              </dt>
              <dd className="ps-11 text-xs leading-relaxed text-muted-foreground">
                {row.detail}
                {row.complete && <span className="sr-only"> · {t(language, "dailyPath.complete")}</span>}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Zap size={16} aria-hidden="true" />
            {t(language, "progress.activeStreakSummary")}: {count(streakCount)}
          </span>
          <span>
            {t(language, "progress.lifetimePalmsSummary")}: {count(palmCount)}
          </span>
        </div>
        <details className="group rounded-2xl border border-border px-4" data-testid="path-growth-guide">
          <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 py-3 text-label font-bold focus-visible:ring-[3px] focus-visible:ring-ring">
            {t(language, "dailyPath.howItGrows")}
            <ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <ol className="flex flex-col gap-4 pb-4">
            {(["palm", "golden", "oasis"] as const).map((reward) => (
              <li
                key={reward}
                className="flex items-center gap-3"
                data-reward-tier={reward}
                aria-current={tier === reward ? "step" : undefined}
              >
                <PathRewardMark tier={reward} size={28} />
                <div className="min-w-0">
                  <p className="text-label font-bold">
                    {t(
                      language,
                      reward === "palm"
                        ? "dailyPath.regularPalm"
                        : reward === "golden"
                          ? "dailyPath.goldenPalm"
                          : "dailyPath.oasisPalm",
                    )}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t(
                      language,
                      reward === "palm"
                        ? "dailyPath.palmRule"
                        : reward === "golden"
                          ? "dailyPath.goldenRule"
                          : "dailyPath.oasisRule",
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </details>

        {onViewProgress && (
          <button
            type="button"
            data-testid="path-view-progress"
            onClick={() => {
              onClose();
              onViewProgress();
            }}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-label font-black text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <BarChart3 size={20} aria-hidden="true" className="shrink-0" />
            {t(language, "dailyPath.viewProgress")}
          </button>
        )}
      </div>
    </Modal>
  );
}
