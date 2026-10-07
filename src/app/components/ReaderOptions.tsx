import { createContext, useContext, type ReactNode } from "react";
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";

export const ReaderOptionsContext = createContext<{ sheet: boolean; close: () => void }>({
  sheet: false,
  close: () => {},
});

/** Dialog actions use native buttons; the wide menu retains Radix keyboard navigation. */
export function ReaderOptionsAction(props: {
  children: ReactNode;
  onClick?: () => void;
  onSelect?: () => void;
  disabled?: boolean;
  keepOpen?: boolean;
  className?: string;
  "data-testid"?: string;
}) {
  const { sheet, close } = useContext(ReaderOptionsContext);
  const { keepOpen, ...actionProps } = props;
  if (!sheet) return <DropdownMenuItem {...actionProps} />;
  const { children, onClick, onSelect, disabled, className, ...rest } = actionProps;
  return (
    <button
      type="button"
      disabled={disabled}
      data-testid={rest["data-testid"]}
      className={`flex min-h-11 w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-start text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-40 ${className ?? ""}`}
      onClick={() => {
        if (!keepOpen) close();
        onClick?.();
        onSelect?.();
      }}
    >
      {children}
    </button>
  );
}

export function ReaderOptionsDivider({ className }: { className?: string }) {
  const { sheet } = useContext(ReaderOptionsContext);
  return sheet ? <hr className={className} /> : <DropdownMenuSeparator className={className} />;
}

export function ReaderOptionsSection({ title, children }: { title: string; children: ReactNode }) {
  const { sheet } = useContext(ReaderOptionsContext);
  if (!sheet)
    return (
      <>
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        {children}
      </>
    );
  return (
    <details className="border-t border-border/60">
      <summary className="min-h-11 cursor-pointer rounded-xl px-2.5 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
        {title}
      </summary>
      <div className="pb-2">{children}</div>
    </details>
  );
}
