import { useId, useRef, useState } from "react";
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
}: {
  series: readonly RecordingTimelineSeries[];
  language: AppLanguage;
  period: InsightPeriod;
  title: string;
  testId: string;
}) {
  const id = useId();
  const rangeRef = useRef<HTMLInputElement>(null);
  const [seriesId, setSeriesId] = useState(series[0]?.id ?? "");
  const [pointIndex, setPointIndex] = useState<number | null>(null);
  const active = series.find((item) => item.id === seriesId) ?? series[0];
  const points = active?.points ?? [];
  const selectedIndex = Math.min(pointIndex ?? points.length - 1, points.length - 1);
  const selected = points[selectedIndex];
  const previous = points[selectedIndex - 1];
  const rate = (point: InsightTimelinePoint) =>
    point.possible ? Math.round((point.recorded / point.possible) * 100) : 0;
  const value = (point: InsightTimelinePoint) => formatPercentage(rate(point), language);
  const pointCount = (point: InsightTimelinePoint) =>
    progressText(language, point.days === 1 ? "insights.pointSingleDay" : "insights.pointRecords", {
      count: formatNumerals(point.recorded, language),
      days: formatNumerals(point.days, language),
    });
  const pointText = (point: InsightTimelinePoint) => `${point.label}: ${value(point)} · ${pointCount(point)}`;
  const change = getTimelineChange(points, selectedIndex);
  const x = (index: number) => (points.length === 1 ? 250 : 8 + (index * 484) / (points.length - 1));
  const y = (point: InsightTimelinePoint) => 184 - rate(point) * 1.76;
  const ticks = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])].filter(
    (index) => index >= 0 && points[index],
  );
  return (
    <section data-testid={testId} aria-labelledby={`${id}-heading`} className="min-w-0 space-y-3">
      <h3 id={`${id}-heading`} className="text-base font-bold">
        {title}
      </h3>
      <div role="group" aria-label={progressText(language, "insights.focusTrend")} className="flex flex-wrap gap-2">
        {series.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={active?.id === item.id}
            onClick={() => setSeriesId(item.id)}
            className={`min-h-11 rounded-lg border px-3 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${active?.id === item.id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}
          >
            <span aria-hidden="true" className="me-1">
              {active?.id === item.id ? "✓" : ""}
            </span>
            {item.label}
          </button>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {progressText(language, "insights.recordingRate")} · {progressText(language, `insights.${period}Points`)}
      </p>
      {selected ? (
        <>
          <div dir="ltr" className="flex min-w-0 gap-2">
            <div
              aria-hidden="true"
              data-testid="recording-time-scale"
              className="flex h-48 shrink-0 flex-col justify-between text-xs text-muted-foreground"
            >
              {[100, 50, 0].map((percent) => (
                <span key={percent}>{formatPercentage(percent, language)}</span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="relative h-48">
                <svg
                  role="img"
                  aria-labelledby={`${id}-chart-title ${id}-chart-desc`}
                  aria-describedby={`${id}-measure`}
                  viewBox="0 0 500 192"
                  preserveAspectRatio="none"
                  className="h-48 w-full overflow-visible"
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
                  {points.length > 1 && (
                    <polyline
                      data-testid="recording-time-line"
                      points={points.map((point, index) => `${x(index)},${y(point)}`).join(" ")}
                      stroke="var(--primary)"
                      fill="none"
                      strokeWidth="3"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  <line
                    x1={x(selectedIndex)}
                    x2={x(selectedIndex)}
                    y1="8"
                    y2="184"
                    stroke="var(--muted-foreground)"
                    strokeDasharray="3 5"
                    vectorEffect="non-scaling-stroke"
                  />
                  {points.map((point, index) => (
                    <circle
                      key={point.startKey}
                      cx={x(index)}
                      cy={y(point)}
                      r={index === selectedIndex ? 5 : 3}
                      fill="var(--card)"
                      stroke="var(--primary)"
                      strokeWidth={index === selectedIndex ? 3 : 2}
                      vectorEffect="non-scaling-stroke"
                    >
                      <title>{pointText(point)}</title>
                    </circle>
                  ))}
                </svg>
                {points.length > 1 && (
                  <button
                    type="button"
                    aria-label={`${title}: ${progressText(language, "insights.selectPoint")}`}
                    aria-describedby={`${id}-measure`}
                    className="absolute inset-0 h-full w-full rounded bg-transparent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    onClick={(event) => {
                      if (!event.detail) {
                        rangeRef.current?.focus();
                        return;
                      }
                      const box = event.currentTarget.getBoundingClientRect();
                      const position = (((event.clientX - box.left) / box.width) * 500 - 8) / 484;
                      setPointIndex(
                        Math.max(0, Math.min(points.length - 1, Math.round(position * (points.length - 1)))),
                      );
                    }}
                    onKeyDown={(event) => {
                      const next =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? points.length - 1
                            : event.key === "ArrowRight"
                              ? Math.min(selectedIndex + 1, points.length - 1)
                              : event.key === "ArrowLeft"
                                ? Math.max(0, selectedIndex - 1)
                                : null;
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
                  <bdi key={index} className="min-w-0 flex-1 break-words text-center first:text-start last:text-end">
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
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {selected.label} · {pointCount(selected)}
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
                dir="ltr"
                className="h-11 w-full cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              />
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {progressText(language, "insights.onePoint")}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {progressText(language, "insights.noCompleteDays")}
        </p>
      )}
      <details className="text-xs text-muted-foreground">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
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
