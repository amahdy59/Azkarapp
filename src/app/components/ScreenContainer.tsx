import { type ReactNode, type HTMLAttributes } from "react";

interface ScreenContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
}

export function ScreenContainer({ children, className = "", dir, ...props }: ScreenContainerProps) {
  return (
    <div
      className={`flex h-full flex-col bg-background px-page pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))] ${className}`}
      dir={dir}
      {...props}
    >
      {children}
    </div>
  );
}
