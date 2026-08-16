import React from "react";
import { Card } from "./Card";

export interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  subtitle: string;
}

export function StatCard({ title, icon, value, subtitle }: StatCardProps) {
  return (
    <Card className="flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[0.8125rem] font-extrabold text-foreground">{title}</span>
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">{icon}</span>
      </div>
      <div className="mt-3 text-start">
        {/* No dir="auto" here: a digits-only string resolves to LTR, which would
            left-align the value against its own right-aligned subtitle in Arabic. */}
        <p className="text-2xl md:text-3xl font-black text-foreground">{value}</p>
        <p className="text-[0.75rem] font-semibold text-muted-foreground mt-0.5" dir="auto">
          {subtitle}
        </p>
      </div>
    </Card>
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
    <Card className="flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[0.8125rem] font-extrabold text-foreground">{title}</span>
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">{icon}</span>
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
          className="flex min-h-[36px] items-center justify-center rounded-xl bg-primary px-3.5 text-xs font-black text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shrink-0 shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {actionLabel}
        </button>
      </div>
    </Card>
  );
}
