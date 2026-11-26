import type { ReactNode } from "react";

/** Equal side tracks keep the title centered even when the action counts differ. */
export function ReadingHeroToolbar({
  title,
  back,
  children,
  testId,
}: {
  title: string;
  back: ReactNode;
  children: ReactNode;
  testId: string;
}) {
  return (
    <div
      data-overlay-edge="top"
      className="relative z-10 grid w-full grid-cols-3 items-center gap-3"
      data-testid={testId}
    >
      <div className="flex min-w-0 items-center">{back}</div>
      <h1 className="min-w-0 break-words text-lg md:text-xl font-extrabold leading-tight text-foreground" dir="auto">
        {title}
      </h1>
      {children}
    </div>
  );
}
