import { useEffect, useId, useRef, useState } from "react";
import type { AppLanguage } from "../types";
import type { ProgressTrendPoint } from "../progressTrend";
import { formatNumerals, formatPercentage, formatRatio } from "../formatting";
import { t } from "../i18n";
import { ChevronNext } from "./icons";
import { RecordedComparisonBar } from "./RecordedComparisonBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function ProgressTrendChart({
  points: suppliedPoints,
  language,
  onExplore,
  testId,
  interval = "monthly",
}: {
  points: readonly ProgressTrendPoint[];
  language: AppLanguage;
  onExplore?: (date: Date) => void;
  testId?: string;
  interval?: "weekly" | "monthly";
}) {
  const id = useId();
  const canvas = useRef<HTMLDivElement>(null);
  const [availableWidth, setWidth] = useState(600);
  const [labelSize, setLabelSize] = useState(12);
  const [selectedKey, setSelectedKey] = useState("");
  const points = suppliedPoints.filter((point) => point.rate !== null && point.possible > 0);
  const selected = points.find((point) => point.key === selectedKey);
  const rtl = language === "ar";
  const columns = interval === "weekly";
  useEffect(() => {
    const node = canvas.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setWidth(Math.max(200, entry.contentRect.width));
        setLabelSize(Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.75);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const periodIdentity = points.map((point) => point.key).join("|");
  useEffect(() => {
    setSelectedKey("");
  }, [periodIdentity]);
  const left = Math.max(52, labelSize * 4);
  const width = Math.max(availableWidth, left + 140);
  const right = width - Math.max(28, labelSize * 3);
  const hasActivity = points.some((point) => point.completed > 0);
  const chartHeight = hasActivity ? 220 : 160;
  const top = Math.max(24, labelSize * 2);
  const bottom = chartHeight - 44;
  const step = (right - left) / Math.max(1, points.length);
  const labelStride = Math.max(
    1,
    Math.ceil((Math.max(...points.map((point) => point.label.length), 1) * labelSize * 0.65 + 12) / step),
  );
  const x = (index: number) => left + (rtl ? points.length - index - 0.5 : index + 0.5) * step;
  const y = (rate: number) => bottom - (rate / 100) * (bottom - top);
  const value = (point: ProgressTrendPoint) => formatPercentage(point.rate ?? 0, language);
  const peak = hasActivity
    ? points.reduce((best, point) => ((point.rate ?? 0) > (best.rate ?? 0) ? point : best), points[0]!)
    : undefined;
  const peakText = peak ? t(language, "progressTrend.peak", { period: peak.label, rate: value(peak) }) : "";
  return (
    <section
      className="rounded-2xl border border-border bg-card p-4 sm:p-5"
      aria-labelledby={`${id}-title`}
      data-testid={testId}
    >
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id={`${id}-title`} data-testid="progress-primary-heading" className="text-xl font-bold text-foreground">
            {t(language, "progressTrend.title")}
          </h2>
          <p className="text-xs font-semibold text-muted-foreground" dir={rtl ? "rtl" : "ltr"}>
            {t(language, "progressTrend.timelineDirectionOldest")} <span aria-hidden="true">{rtl ? "←" : "→"}</span>{" "}
            {t(language, "progressTrend.timelineDirectionCurrent")}
          </p>
        </div>
        <p id={`${id}-description`} className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t(language, columns ? "progressTrend.weeklyDescription" : "progressTrend.monthlyDescription")}
        </p>
        {peak && (
          <p className="mt-2 text-sm font-semibold text-foreground" data-testid="trend-peak">
            {peakText}
            {peak.partial ? ` · ${t(language, "progressTrend.soFar")}` : ""}
          </p>
        )}
      </div>
      {points.length > 0 && (
        <div ref={canvas} className="min-w-0">
          <p id={`${id}-interaction`} className="mb-2 text-xs leading-relaxed text-muted-foreground">
            {t(language, "progressTrend.interactionHint")}
          </p>
          <div
            className="overflow-x-auto rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            role="region"
            aria-label={t(language, "progressTrend.chartRegion")}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Named native chart scroll region remains keyboard-scrollable at enlarged text.
            tabIndex={0}
            aria-describedby={`${id}-interaction`}
          >
            <div className="relative" style={{ width, height: chartHeight }}>
              <svg
                viewBox={`0 0 ${width} ${chartHeight}`}
                width={width}
                height={chartHeight}
                role="img"
                aria-labelledby={`${id}-title`}
                aria-describedby={`${id}-description ${id}-data-hint`}
              >
                <title>{t(language, "progressTrend.chartRegion")}</title>
                {[0, 50, 100].map((rate) => (
                  <g key={rate}>
                    <line
                      x1={left}
                      x2={right}
                      y1={y(rate)}
                      y2={y(rate)}
                      stroke="var(--border)"
                      strokeDasharray={rate ? "3 6" : undefined}
                    />
                    <text
                      x={left - 10}
                      y={y(rate) + 4}
                      textAnchor="end"
                      fill="var(--muted-foreground)"
                      fontSize={labelSize}
                      direction="ltr"
                    >
                      {formatPercentage(rate, language)}
                    </text>
                  </g>
                ))}
                {!columns && points.length > 1 && (
                  <path
                    d={points.map((point, index) => `${index ? "L" : "M"}${x(index)},${y(point.rate ?? 0)}`).join(" ")}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {points.map((point, index) => (
                  <g key={point.key}>
                    {columns ? (
                      <rect
                        data-testid="trend-column"
                        x={x(index) - Math.min(30, step / 4)}
                        y={y(point.rate ?? 0)}
                        width={Math.min(60, step / 2)}
                        height={bottom - y(point.rate ?? 0)}
                        rx={4}
                        fill="var(--primary)"
                      />
                    ) : (
                      <circle
                        cx={x(index)}
                        cy={y(point.rate ?? 0)}
                        r={selected?.key === point.key ? 6 : 4}
                        fill="var(--card)"
                        stroke="var(--primary)"
                        strokeWidth="2.5"
                      />
                    )}
                    {columns && step >= labelSize * 3 && (
                      <text
                        x={x(index)}
                        y={Math.max(labelSize, y(point.rate ?? 0) - 9)}
                        textAnchor="middle"
                        fontSize={labelSize}
                        fill="var(--foreground)"
                        direction="ltr"
                      >
                        {value(point)}
                      </text>
                    )}
                    {selected?.key === point.key && (
                      <line
                        x1={x(index)}
                        x2={x(index)}
                        y1={top}
                        y2={bottom}
                        stroke="var(--muted-foreground)"
                        strokeDasharray="3 5"
                      />
                    )}
                    {(index === 0 ||
                      index === points.length - 1 ||
                      (index % labelStride === 0 && index < points.length - labelStride)) && (
                      <text
                        x={x(index)}
                        y={bottom + labelSize + 10}
                        textAnchor="middle"
                        fontSize={labelSize}
                        fill="var(--muted-foreground)"
                        direction={rtl ? "rtl" : "ltr"}
                      >
                        {point.label}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
              {step >= 44 &&
                points.map((point, index) => (
                  <button
                    key={point.key}
                    type="button"
                    aria-label={`${point.label}: ${value(point)}${point.partial ? ` · ${t(language, "progressTrend.soFar")}` : ""}`}
                    aria-pressed={selected?.key === point.key}
                    onClick={() => setSelectedKey(point.key)}
                    className="absolute size-11 rounded-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    style={{ left: x(index) - 22, top: y(point.rate ?? 0) - 22, width: 44, height: 44 }}
                  >
                    <span className="sr-only">{point.label}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
      {!hasActivity && <p className="mb-4 text-sm text-muted-foreground">{t(language, "progressTrend.empty")}</p>}
      {points.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <label htmlFor={`${id}-period`} className="mb-2 block text-sm font-bold text-foreground">
            {t(language, columns ? "progressTrend.selectRange" : "progressTrend.selectMonth")}
          </label>
          <Select dir={rtl ? "rtl" : "ltr"} value={selected ? selectedKey : ""} onValueChange={setSelectedKey}>
            <SelectTrigger id={`${id}-period`}>
              <SelectValue placeholder={t(language, "progressTrend.selectPeriod")} />
            </SelectTrigger>
            <SelectContent collisionPadding={16} className="max-w-[calc(100vw-2rem)]">
              {points.map((point) => (
                <SelectItem key={point.key} value={point.key}>
                  {point.label}
                  {point.partial ? ` · ${t(language, "progressTrend.soFar")}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected && (
            <div className="mt-3 space-y-3" role="status" aria-atomic="true">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-foreground">
                  <strong>
                    {selected.label} · {value(selected)}
                  </strong>
                  <span className="mt-1 block text-muted-foreground">
                    {t(language, "progressTrend.recorded", {
                      count: formatRatio(selected.completed, selected.possible, language),
                    })}
                    {selected.partial ? ` · ${t(language, "progressTrend.soFar")}` : ""}
                  </span>
                </p>
                {onExplore && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selected.dates[0]) onExplore(selected.dates[0]);
                    }}
                    className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    {t(language, "progressTrend.openMonth")}
                    <ChevronNext size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
              {selected.routines && (
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  {(["morning", "evening", "before_sleep"] as const).map((routine) => (
                    <div key={routine} className="space-y-1">
                      <dt className="text-muted-foreground">
                        {t(language, routine === "before_sleep" ? "progressTrend.sleep" : `progressTrend.${routine}`)}
                      </dt>
                      <dd className="font-bold">
                        <bdi dir="ltr">{formatRatio(selected.routines![routine], selected.possible / 3, language)}</bdi>
                        <RecordedComparisonBar
                          language={language}
                          max={selected.possible / 3}
                          label={`${t(language, routine === "before_sleep" ? "progressTrend.sleep" : `progressTrend.${routine}`)}: ${formatRatio(selected.routines![routine], selected.possible / 3, language)}`}
                          segments={[{ label: routine, value: selected.routines![routine], color: "var(--primary)" }]}
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
        </div>
      )}
      <details className="mt-4 border-t border-border pt-1">
        <summary
          id={`${id}-data-hint`}
          className="min-h-11 cursor-pointer py-3 text-sm font-bold text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {t(language, "progressTrend.viewData")}
        </summary>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{t(language, "progressTrend.calculation")}</p>
        <table className="w-full text-start text-sm">
          <caption className="sr-only">{t(language, "progressTrend.title")}</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-2 text-start">
                {t(language, "progressTrend.period")}
              </th>
              <th scope="col" className="py-2 text-end">
                {t(language, "progressTrend.completion")}
              </th>
              <th scope="col" className="py-2 text-end">
                {t(language, "progressTrend.records")}
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.key} className="border-b border-border">
                <th scope="row" className="py-3 text-start font-medium">
                  {point.label}
                  {point.partial && (
                    <span className="block text-xs text-muted-foreground">{t(language, "progressTrend.soFar")}</span>
                  )}
                </th>
                <td className="py-3 text-end">
                  <bdi>{value(point)}</bdi>
                </td>
                <td className="py-3 text-end">
                  <bdi dir="ltr">{formatRatio(point.completed, point.possible, language)}</bdi>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <span className="sr-only">
          {t(language, "progressTrend.elapsed", {
            days: formatNumerals(
              points.reduce((sum, point) => sum + point.possible / 3, 0),
              language,
            ),
          })}
        </span>
      </details>
    </section>
  );
}
