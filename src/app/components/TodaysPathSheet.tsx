import { Modal } from "./ResponsiveSheet";
import { Zap } from "./icons";
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
    },
    {
      title: t(language, "dailyPath.quran"),
      detail: status.quran.active
        ? t(language, "dailyPath.pages", { read: count(status.quran.progress), goal: count(status.quran.goal) })
        : t(language, "dailyPath.noGoalYet"),
      complete: status.quran.complete,
    },
    {
      title: t(language, "dailyPath.mosque"),
      detail: t(language, "dailyPath.mosqueRecorded", { done: count(status.salah.mosqueCount) }),
      complete: status.salah.mosqueCount >= 5,
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
    >
      <div className="flex flex-col gap-5 px-5 py-5">
        <section
          className="rounded-2xl border border-border bg-muted/40 p-4 text-center"
          aria-label={t(language, "dailyPath.todayReward")}
        >
          <div className="flex justify-center">
            <PathRewardMark tier={tier} size={48} />
          </div>
          <p className="mt-3 text-subtitle font-black">
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
        </section>

        <dl className="divide-y divide-border" aria-label={t(language, "dailyPath.recordedToday")}>
          {rows.map((row) => (
            <div
              key={row.title}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0"
              data-testid={"path-pillar-" + row.title}
            >
              <dt className="text-label font-bold">{row.title}</dt>
              <dd className="text-label text-muted-foreground">
                {row.detail}
                {row.complete && <span className="sr-only"> · {t(language, "dailyPath.complete")}</span>}
              </dd>
            </div>
          ))}
        </dl>

        <section aria-label={t(language, "dailyPath.howItGrows")} className="rounded-2xl border border-border p-4">
          <h3 className="mb-3 text-label font-black">{t(language, "dailyPath.howItGrows")}</h3>
          <ol className="flex flex-col gap-4">
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
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Zap size={16} aria-hidden="true" />
            {t(language, "progress.activeStreakSummary")}: {count(streakCount)}
          </span>
          <span>
            {t(language, "progress.lifetimePalmsSummary")}: {count(palmCount)}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground" data-testid="todays-path-summary">
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
