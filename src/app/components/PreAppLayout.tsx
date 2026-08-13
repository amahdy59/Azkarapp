import type { HTMLAttributes, ReactNode } from "react";

interface PreAppLayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  contentClassName?: string;
}

export function PreAppLayout({ children, className = "", contentClassName = "", ...props }: PreAppLayoutProps) {
  return (
    <div className={`h-full overflow-y-auto bg-background ${className}`} {...props}>
      <div
        data-testid="pre-app-content"
        className={`mx-auto flex min-h-full w-full max-w-[var(--content-form)] flex-col ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
