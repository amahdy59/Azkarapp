import type { ReactNode } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/ui/button";

export function InformationCard({
  icon,
  title,
  body,
  headingLevel = 2,
  actionLabel,
  actionIcon,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  headingLevel?: 2 | 3;
  /** Optional single action below the body, e.g. "Report an issue". */
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <Card as="section">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <Heading className="text-[0.9375rem] font-semibold text-foreground">{title}</Heading>
          <p className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground">{body}</p>
        </div>
      </div>
      {actionLabel && onAction && (
        <Button type="button" onClick={onAction} className="mt-3 w-full text-[0.8125rem]">
          {actionLabel}
          {actionIcon}
        </Button>
      )}
    </Card>
  );
}
