import type { ReactNode } from "react";

export function InformationCard({
  icon,
  title,
  body,
  headingLevel = 2,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <Heading className="text-[0.9375rem] font-semibold text-foreground">{title}</Heading>
          <p className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground">{body}</p>
        </div>
      </div>
    </section>
  );
}
