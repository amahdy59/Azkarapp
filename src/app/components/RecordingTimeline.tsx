import { ProgressSelectField } from "./ProgressSelectField";
import { BarChart3 } from "./icons";
import { useId, useRef, useState, type ReactNode } from "react";
import type { AppLanguage } from "../types";
import { formatNumerals, formatPercentage } from "../formatting";
import { progressText } from "../i18n/progressInsights";
import { getTimelineChange, type InsightPeriod, type InsightTimelinePoint } from "../progressInsights";

export interface RecordingTimelineSeries {
  id: string;
  label: string;
  measure: string;
  points: readonly InsightTimelinePoint[];
}

/** One readable time chart with direct series selection. Comparisons below
 * answer a different question; this plot keeps temporal change visible first. */
export function RecordingTimeline({
  series,
  language,
  period,
  title,
  testId,
  hideSeriesControls = false,
  leadingControl,
  seriesLabel,
  valueKind = "rate",
  countUnit,
  bucketDescription,
}: {
  series: readonly RecordingTimelineSeries[];
  language: AppLanguage;
  period: InsightPeriod;
  title: string;
  testId: string;
  hideSeriesControls?: boolean;
  leadingControl?: ReactNode;
  seriesLabel?: string;
  valueKind?: "rate" | "count";
  countUnit?: string;
  bucketDescription?: string;
}) {
  const id = useId();
  const rtl = language === "ar";
  const direction = rtl ? "rtl" : "ltr";
  const rangeRef = useRef<HTMLInputElement>(null);
  const [seriesId, setSeriesId] = useState(series[0]?.id ?? "");
  const [pointIndex, setPointIndex] = useState<number | null>(null);
  const active = series.find((item) => item.id === seriesId) ?? series[0];
  const points = active?.points ?? [];
  const selectedIndex = Math.min(pointIndex ?? points.length - 1, points.length - 1);
  const selected = points[selectedIndex];
  const previous = points[selectedIndex - 1];
  const rate = (point: InsightTimelinePoint) => (point.possible ? (point.recorded / point.possible) * 100 : 0);
  const missing = (point: InsightTimelinePoint) => valueKind === "rate" && !point.possible;
  const value = (point: InsightTimelinePoint) =>
    missing(point)
      ? "—"
      : valueKind === "count"
        ? formatNumerals(point.recorded, language)
        : formatPercentage(Math.round(rate(point)), language);
  const pointCount = (point: InsightTimelinePoint) =>
    progressText(language, point.days === 1 ? "insights.pointSingleDay" : "insights.pointRecords", {
      count: formatNumerals(point.recorded, language),
      days: formatNumerals(point.days, language),
    });
  const pointText = (point: InsightTimelinePoint) => `${point.label}: ${value(point)} · ${pointCount(point)}`;
  const change = valueKind === "rate" ? getTimelineChange(points, selectedIndex) : null;
  const flat =
    points.length > 1 &&
    points.every(
      (point) =>
        !missing(point) &&
        (valueKind === "count"
          ? point.recorded === points[0]!.recorded
          : point.recorded * points[0]!.possible === points[0]!.recorded * point.possible),
    );
  const plotHeight = flat ? "7rem" : "11rem";
  const maximum =
    valueKind === "count" ? Math.max(4, Math.ceil(Math.max(0, ...points.map((point) => point.recorded)) / 4) * 4) : 100;
  const x = (index: number) => {
    const position = points.length === 1 ? 250 : 8 + (index * 484) / (points.length - 1);
    return rtl ? 500 - position : position;
  };
  const pointForKey = (key: string) => {
    if (key === "Home") return 0;
    if (key === "End") return points.length - 1;
    const delta = key === "ArrowRight" ? (rtl ? -1 : 1) : key === "ArrowLeft" ? (rtl ? 1 : -1) : null;
    return delta === null ? null : Math.max(0, Math.min(points.length - 1, selectedIndex + delta));
  };
  const y = (point: InsightTimelinePoint) =>
    184 - ((valueKind === "count" ? point.recorded : rate(point)) / maximum) * 176;
  const segments: { point: InsightTimelinePoint; index: number }[][] = [];
  for (const [index, point] of points.entries()) {
    if (missing(point)) {
      segments.push([]);
      continue;
    }
    if (!segments.length) segments.push([]);
    segments.at(-1)!.push({ point, index });
  }
  const ticks = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])].filter(
    (index) => index >= 0 && points[index],
  );
  return (
    <section
      data-testid={testId}
      data-progress-focus-context
      aria-labelledby={`${id}-heading`}
      className="min-w-0 space-y-3"
    >
      <h3 id={`${id}-heading`} className="text-base font-bold">
        {title}
      </h3>
      {(leadingControl || (!hideSeriesControls && series.length > 1)) && (
        <div className="recording-timeline-filters">
          {leadingControl}
          {!hideSeriesControls && series.length > 1 && (
            <ProgressSelectField
              label={seriesLabel ?? progressText(language, "insights.focusTrend")}
              language={language}
              icon={BarChart3}
              value={active?.id ?? ""}
              onChange={setSeriesId}
              options={series.map((item) => ({ value: item.id, label: item.label }))}
            />
          )}
        </div>
      )}
      <p className="progress-help">
        {bucketDescription ??
          `${progressText(language, "insights.recordingRate")} · ${progressText(language, `insights.${period}Points`)}`}
      </p>
      {flat && (
        <p className="text-sm font-semibold" data-testid="recording-flat-summary">
          {progressText(language, "insights.flatTrend", {
            count: formatNumerals(points.length, language),
            value: value(points[0]!),
          })}
        </p>
      )}
      {selected ? (
        <>
          <div dir={direction} className="flex min-w-0 gap-2">
            <div
              aria-hidden="true"
              data-testid="recording-time-scale"
              className="flex shrink-0 flex-col justify-between text-xs text-muted-foreground"
              style={{ height: plotHeight }}
            >
              {[maximum, maximum / 2, 0].map((number) => (
                <span key={number}>
                  {valueKind === "count" ? formatNumerals(number, language) : formatPercentage(number, language)}
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="relative" style={{ height: plotHeight }}>
                <svg
                  role="img"
                  aria-labelledby={`${id}-chart-title ${id}-chart-desc`}
                  aria-describedby={`${id}-measure`}
                  viewBox="0 0 500 192"
                  preserveAspectRatio="none"
                  className="h-full w-full overflow-visible"
                  data-testid="recording-time-plot"
                >
                  <title id={`${id}-chart-title`}>
                    {title} · {active?.label}
                  </title>
                  <desc id={`${id}-chart-desc`}>{points.map(pointText).join("; ")}</desc>
                  {[8, 96, 184].map((height, index) => (
                    <line
                      key={height}
                      x1="0"
                      x2="500"
                      y1={height}
                      y2={height}
                      stroke="var(--border-control)"
                      strokeWidth="1"
                      strokeDasharray={index === 1 ? "3 6" : undefined}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  {segments
                    .filter((segment) => segment.length > 1)
                    .map((segment) => (
                      <polyline
                        key={segment[0]!.index}
                        data-testid="recording-time-line"
                        points={segment.map(({ point, index }) => `${x(index)},${y(point)}`).join(" ")}
                        stroke="var(--primary)"
                        fill="none"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                  <line
                    x1={x(selectedIndex)}
                    x2={x(selectedIndex)}
                    y1="8"
                    y2="184"
                    stroke="var(--muted-foreground)"
                    strokeDasharray="3 5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                {points.map(
                  (point, index) =>
                    !missing(point) && (
                      <span
                        key={point.startKey}
                        data-testid="recording-time-point"
                        aria-hidden="true"
                        className="pointer-events-none absolute rounded-full border-2 border-primary bg-card"
                        style={{
                          left: `${x(index) / 5}%`,
                          top: `${y(point) / 1.92}%`,
                          width: index === selectedIndex ? 10 : 6,
                          height: index === selectedIndex ? 10 : 6,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    ),
                )}

                {points.length > 1 && (
                  <button
                    type="button"
                    aria-label={`${title}: ${progressText(language, "insights.selectPoint")}`}
                    aria-describedby={`${id}-measure`}
                    className="absolute inset-0 h-full w-full rounded bg-transparent progress-focus"
                    onClick={(event) => {
                      if (!event.detail) {
                        rangeRef.current?.focus();
                        return;
                      }
                      const box = event.currentTarget.getBoundingClientRect();
                      const physical = (((event.clientX - box.left) / box.width) * 500 - 8) / 484;
                      const position = rtl ? 1 - physical : physical;
                      setPointIndex(
                        Math.max(0, Math.min(points.length - 1, Math.round(position * (points.length - 1)))),
                      );
                    }}
                    onKeyDown={(event) => {
                      const next = pointForKey(event.key);
                      if (next !== null) {
                        event.preventDefault();
                        setPointIndex(next);
                      }
                    }}
                  />
                )}
              </div>
              <div aria-hidden="true" className="mt-2 flex justify-between gap-2 text-xs text-muted-foreground">
                {ticks.map((index) => (
                  <bdi
                    key={index}
                    className={`min-w-0 flex-1 break-words text-center ${ticks.length > 1 ? "first:text-start last:text-end" : ""}`}
                  >
                    {points[index]!.axisLabel}
                  </bdi>
                ))}
              </div>
            </div>
          </div>
          <div
            className="border-s-2 border-primary ps-3"
            role="status"
            aria-atomic="true"
            data-testid="timeline-readout"
          >
            <p className="flex flex-wrap items-baseline gap-2 text-sm font-semibold">
              <span>{active?.label}</span>
              <bdi className="text-lg font-bold">{value(selected)}</bdi>
            </p>
            <p className="mt-1 progress-help">
              {selected.label} ·{" "}
              {valueKind === "count"
                ? `${formatNumerals(selected.recorded, language)} ${countUnit ?? ""}`
                : pointCount(selected)}
              {selected.partial ? ` · ${progressText(language, "insights.partialBucket")}` : ""}
            </p>
            {change !== null && previous && (
              <p className="mt-2 text-xs leading-relaxed text-foreground" data-testid="timeline-change">
                {progressText(
                  language,
                  change === 0
                    ? "insights.changeSteady"
                    : change > 0
                      ? "insights.changeHigher"
                      : "insights.changeLower",
                  { count: formatNumerals(Math.abs(change), language), previous: previous.label },
                )}
              </p>
            )}
          </div>
          {points.length > 1 ? (
            <div>
              <label htmlFor={`${id}-point`} className="block text-xs font-semibold">
                {progressText(language, "insights.exploreTimeline")}
              </label>
              <input
                ref={rangeRef}
                id={`${id}-point`}
                type="range"
                min={0}
                max={points.length - 1}
                step={1}
                value={selectedIndex}
                aria-valuetext={pointText(selected)}
                onChange={(event) => setPointIndex(Number(event.target.value))}
                dir={direction}
                onKeyDown={(event) => {
                  const next = pointForKey(event.key);
                  if (next !== null) {
                    event.preventDefault();
                    setPointIndex(next);
                  }
                }}
                className="h-11 w-full cursor-pointer accent-primary progress-focus"
              />
            </div>
          ) : (
            <p className="progress-help">{progressText(language, "insights.onePoint")}</p>
          )}
        </>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {progressText(language, "insights.noCompleteDays")}
        </p>
      )}
      <details className="text-xs text-muted-foreground">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold progress-focus">
          {progressText(language, "insights.aboutChart")}
        </summary>
        <p id={`${id}-measure`} className="leading-relaxed">
          {active?.measure} {progressText(language, "insights.chronological")}{" "}
          {progressText(language, "insights.pointHelp")}
        </p>
      </details>
    </section>
  );
}
