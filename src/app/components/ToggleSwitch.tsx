export function Toggle({
  checked,
  onChange,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || "Toggle switch"}
      className="relative inline-flex h-[31px] w-[51px] items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
      style={{ background: checked ? "var(--primary)" : "var(--muted)" }}
    >
      <span
        className={`inline-block h-[27px] w-[27px] rounded-full bg-primary-foreground shadow-md transition-transform duration-300 ${checked ? "translate-x-[22px] rtl:-translate-x-[22px]" : "translate-x-[2px] rtl:-translate-x-[2px]"}`}
      />
    </button>
  );
}
