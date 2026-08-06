import React from "react";

export interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  subtitle: string;
}

export function StatCard({ title, icon, value, subtitle }: StatCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-border/40 bg-card p-4.5 backdrop-blur-xl shadow-xl shadow-black/5 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[0.8125rem] font-extrabold text-foreground">{title}</span>
        <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          {icon}
        </span>
      </div>
      <div className="mt-3 text-start">
        <p className="text-2xl md:text-3xl font-black text-foreground" dir="auto">
          {value}
        </p>
        <p className="text-[0.75rem] font-semibold text-muted-foreground mt-0.5" dir="auto">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export interface CompactActionCardProps {
  title: string;
  icon: React.ReactNode;
  contentTitle: string;
  contentSubtitle: string;
  actionLabel: string;
  onAction: () => void;
}

export function CompactActionCard({
  title,
  icon,
  contentTitle,
  contentSubtitle,
  actionLabel,
  onAction,
}: CompactActionCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-border/40 bg-card p-4.5 backdrop-blur-xl shadow-xl shadow-black/5 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[0.8125rem] font-extrabold text-foreground">{title}</span>
        <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
          {icon}
        </span>
      </div>
      <div className="mt-3 text-start flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[0.9375rem] font-black text-foreground truncate" dir="auto">
            {contentTitle}
          </p>
          <p className="text-[0.75rem] font-semibold text-muted-foreground mt-0.5" dir="auto">
            {contentSubtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onAction}
          className="flex min-h-[36px] items-center justify-center rounded-xl bg-[#e2a84a] px-3.5 text-xs font-black text-slate-950 hover:bg-[#ebd074] transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
