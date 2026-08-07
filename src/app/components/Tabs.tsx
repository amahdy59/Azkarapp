import { useRef, type KeyboardEvent, type ReactNode } from "react";

export interface TabDefinition<T extends string> {
  value: T;
  label: ReactNode;
  testId?: string;
}

export function tabId(idPrefix: string, value: string) {
  return `${idPrefix}-tab-${value}`;
}

export function tabPanelId(idPrefix: string, value: string) {
  return `${idPrefix}-panel-${value}`;
}

/**
 * Props to spread onto the element rendering the active tab's content, so the
 * panel is correctly associated with its tab and reachable by keyboard.
 */
export function tabPanelProps(idPrefix: string, activeValue: string) {
  return {
    role: "tabpanel" as const,
    id: tabPanelId(idPrefix, activeValue),
    "aria-labelledby": tabId(idPrefix, activeValue),
    tabIndex: 0,
  };
}

/**
 * Tab list implementing the WAI-ARIA APG tabs pattern with automatic
 * activation: roving tabindex, RTL-aware Arrow keys, and Home/End.
 *
 * Owns semantics and keyboard behavior only — callers supply their own classes
 * and render their own panel (spreading `tabPanelProps`), so this stays a
 * semantics primitive rather than a configurable layout component.
 *
 * Hand-rolled rather than pulling in `@radix-ui/react-tabs`: the pattern needs
 * no portal, focus trap, or positioning, and both call sites keep their
 * existing DOM structure (tab list and panel are not always siblings).
 */
export function TabList<T extends string>({
  value,
  onChange,
  tabs,
  direction,
  idPrefix,
  className = "",
  itemClassName,
  "aria-label": ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  tabs: ReadonlyArray<TabDefinition<T>>;
  direction: "ltr" | "rtl";
  /** Namespace for the generated tab/panel ids; must match the panel's `tabPanelProps`. */
  idPrefix: string;
  className?: string;
  itemClassName: (selected: boolean) => string;
  "aria-label": string;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (index: number) => {
    const next = tabs[index];
    if (!next) return;
    onChange(next.value);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const forward = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = direction === "rtl" ? "ArrowRight" : "ArrowLeft";

    if (event.key === forward) {
      event.preventDefault();
      focusTab((index + 1) % tabs.length);
    } else if (event.key === backward) {
      event.preventDefault();
      focusTab((index - 1 + tabs.length) % tabs.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(tabs.length - 1);
    }
  };

  return (
    <div role="tablist" aria-label={ariaLabel} aria-orientation="horizontal" className={className}>
      {tabs.map((tab, index) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, tab.value)}
            aria-selected={selected}
            aria-controls={tabPanelId(idPrefix, tab.value)}
            tabIndex={selected ? 0 : -1}
            data-testid={tab.testId}
            onClick={() => onChange(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={itemClassName(selected)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
