import { useEffect, useId, useRef, useState } from "react";
import type { AppLanguage } from "../types";
import type { ProgressTrendPoint } from "../progressTrend";
import { formatNumerals, formatPercentage, formatRatio } from "../formatting";
import { t } from "../i18n";
import { ChevronNext } from "./icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function ProgressTrendChart({
  points,
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
  const [width, setWidth] = useState(600);
  const [labelSize, setLabelSize] = useState(12);
  const [selectedKey, setSelectedKey] = useState("");
  const selected = points.find((point) => point.key === selectedKey);
  const rtl = language === "ar";
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
  const left = Math.max(44, labelSize * 3.5);
  const right = width - 14;
  const hasActivity = points.some((point) => point.completed > 0);
  const chartHeight = hasActivity ? 220 : 160;
  const top = 18;
  const bottom = chartHeight - 40;
  const x = (index: number) => {
    const position = points.length <= 1 ? 0.5 : index / (points.length - 1);
    return left + (rtl ? 1 - position : position) * (right - left);
  };
  const y = (rate: number) => bottom - (rate / 100) * (bottom - top);
  const recorded = points.filter((point) => point.rate !== null);
  const segments: string[] = [];
  let segment = "";
  points.forEach((point, index) => {
    if (point.rate === null) {
      if (segment) segments.push(segment);
      segment = "";
      return;
    }
    segment += `${segment ? " L" : "M"}${x(index)},${y(point.rate)}`;
  });
  if (segment) segments.push(segment);
  const value = (point: ProgressTrendPoint) =>
    point.rate === null ? t(language, "progressTrend.upcoming") : formatPercentage(point.rate, language);

  const colWidth = Math.max(8, Math.min(22, (right - left) / Math.max(2, points.length * 1.6)));

  return (
    <section
      className="rounded-2xl border border-border bg-card p-4 sm:p-5"
      aria-labelledby={`${id}-title`}
      data-testid={testId}
    >
      <div className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id={`${id}-title`} data-testid="progress-primary-heading" className="text-xl font-bold text-foreground">
            {t(language, "progressTrend.title")}
          </h2>
          <div
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/30 px-2.5 py-0.5 text-micro font-bold text-muted-foreground"
            dir={rtl ? "rtl" : "ltr"}
          >
            <span>{t(language, "progressTrend.timelineDirectionOldest")}</span>
            <span className="font-black text-primary" aria-hidden="true">
              {rtl ? "←" : "→"}
            </span>
            <span>{t(language, "progressTrend.timelineDirectionCurrent")}</span>
          </div>
        </div>
        <p id={`${id}-description`} className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t(language, interval === "weekly" ? "progressTrend.weeklyDescription" : "progressTrend.monthlyDescription")}
        </p>
      </div>
      <div
        ref={canvas}
        className="min-w-0"
        role="img"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description ${id}-data-hint`}
      >
        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          width="100%"
          height={chartHeight}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={`${id}-wash`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.16" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
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
          {/* Subtle column bars under points for discrete period visualization */}
          {points.map((point, index) => {
            if (point.rate === null) return null;
            const isSel = selected?.key === point.key;
            const colH = Math.max(3, bottom - y(point.rate));
            return (
              <rect
                key={`col-${point.key}`}
                x={x(index) - colWidth / 2}
                y={y(point.rate)}
                width={colWidth}
                height={colH}
                rx={Math.min(4, colWidth / 3)}
                className="cursor-pointer transition-opacity duration-fast"
                fill="var(--primary)"
                opacity={isSel ? 0.75 : 0.22}
                onClick={() => setSelectedKey(point.key)}
              />
            );
          })}
          {/* Axis ticks */}
          {points.map((point, index) => (
            <line
              key={`tick-${point.key}`}
              x1={x(index)}
              x2={x(index)}
              y1={bottom}
              y2={bottom + 4}
              stroke="var(--border)"
              strokeWidth="1.5"
            />
          ))}
          {segments.map((path, index) => {
            const coordinates = path
              .replace(/^M/, "")
              .split(" L")
              .map((pair) => pair.split(",").map(Number));
            const first = coordinates[0]?.[0];
            const last = coordinates[coordinates.length - 1]?.[0];
            return (
              <path
                key={index}
                d={path + " L" + last + "," + bottom + " L" + first + "," + bottom + " Z"}
                fill={"url(#" + id + "-wash)"}
              />
            );
          })}
          {segments.map((path, index) => (
            <path
              key={index}
              d={path}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {points.map((point, index) =>
            point.rate === null ? null : (
              <g key={point.key} className="cursor-pointer" onClick={() => setSelectedKey(point.key)}>
                {/* Generous touch / click hit box that does not increment circle count */}
                <rect
                  x={x(index) - 16}
                  y={y(point.rate) - 16}
                  width={32}
                  height={32}
                  fill="transparent"
                  className="cursor-pointer"
                />
                {selected?.key === point.key && (
                  <>
                    <line
                      x1={x(index)}
                      x2={x(index)}
                      y1={top}
                      y2={bottom}
                      stroke="var(--muted-foreground)"
                      strokeDasharray="3 5"
                    />
                    <g pointerEvents="none" aria-hidden="true">
                      <rect
                        x={Math.max(left, Math.min(right - 58, x(index) - 29))}
                        y={Math.max(top, y(point.rate) - 30)}
                        width={58}
                        height={22}
                        rx={6}
                        fill="var(--popover)"
                        stroke="var(--border)"
                        strokeWidth={1}
                        className="shadow-sm"
                      />
                      <text
                        x={Math.max(left, Math.min(right - 58, x(index) - 29)) + 29}
                        y={Math.max(top, y(point.rate) - 30) + 15}
                        textAnchor="middle"
                        fill="var(--popover-foreground)"
                        fontSize={11}
                        fontWeight="bold"
                      >
                        {value(point)}
                      </text>
                    </g>
                  </>
                )}
                <circle
                  cx={x(index)}
                  cy={y(point.rate)}
                  r={selected?.key === point.key ? 6 : 4}
                  fill="var(--card)"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                />
              </g>
            ),
          )}
        </svg>
        <div
          aria-hidden="true"
          className="-mt-3 mb-4 flex justify-between gap-5 text-xs font-semibold text-muted-foreground"
        >
          <span className="max-w-[45%]">{points[0]?.label}</span>
          <span className="max-w-[45%] text-end">{points[points.length - 1]?.label}</span>
        </div>
      </div>
      {!hasActivity && <p className="mb-4 text-sm text-muted-foreground">{t(language, "progressTrend.empty")}</p>}
      <div className="border-t border-border pt-4">
        <label htmlFor={`${id}-period`} className="mb-2 block text-sm font-bold text-foreground">
          {t(language, "progressTrend.choosePeriod")}
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
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3" role="status" aria-atomic="true">
            <p className="text-sm text-foreground">
              <strong className="text-lg">{value(selected)}</strong>
              {selected.rate !== null && (
                <span className="ms-2 text-muted-foreground">
                  {t(language, "progressTrend.recorded", {
                    count: formatRatio(selected.completed, selected.possible, language),
                  })}
                </span>
              )}
              {selected.partial && (
                <span className="ms-2 text-muted-foreground">{t(language, "progressTrend.soFar")}</span>
              )}
            </p>
            {onExplore && selected.rate !== null && (
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
        )}
      </div>
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
                  <bdi>{point.possible ? formatRatio(point.completed, point.possible, language) : "—"}</bdi>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <span className="sr-only">
          {t(language, "progressTrend.elapsed", {
            days: formatNumerals(
              recorded.reduce((sum, point) => sum + point.possible / 3, 0),
              language,
            ),
          })}
        </span>
      </details>
    </section>
  );
}
