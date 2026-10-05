import { useEffect, useState } from "react";
import {
  isCounterShortcutBlocked,
  setCharacterShortcutsEnabled,
  useCharacterShortcutsEnabled,
} from "../keyboardShortcuts";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import type { CounterShortcut } from "./ZikrComponents";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import { Keyboard } from "./icons";

export function CounterKeyboardHelp({
  shortcuts,
  language,
  direction,
  compact = false,
}: {
  shortcuts: readonly CounterShortcut[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const enabled = useCharacterShortcutsEnabled();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "?" || isCounterShortcutBlocked(event)) return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation();
          event.currentTarget.focus({ preventScroll: true });
          setOpen(true);
        }}
        aria-label={t(language, "reader.keyboardShortcuts")}
        title={t(language, "reader.keyboardShortcuts")}
        aria-haspopup="dialog"
        className={compact ? "hidden size-11 shrink-0 p-0 md:flex" : "mx-auto mt-1 hidden md:flex"}
      >
        {compact ? (
          <Keyboard size={24} className="size-6" aria-hidden="true" />
        ) : (
          t(language, "reader.keyboardShortcuts")
        )}
      </Button>
      <ResponsiveSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t(language, "reader.keyboardShortcuts")}
        language={language}
        direction={direction}
        testId="counter-keyboard-help"
        maxWidthClassName="max-w-md"
        showCloseButton={false}
        drawerClassName="pb-safe"
      >
        <div className="flex min-h-0 flex-col overflow-hidden text-start">
          <SheetHeader
            title={t(language, "reader.keyboardShortcuts")}
            onClose={() => setOpen(false)}
            language={language}
            direction={direction}
          />
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            <dl className="space-y-3">
              {[...shortcuts, { keys: ["?"], label: t(language, "reader.shortcutHelp") }].map((shortcut) => (
                <div key={shortcut.label} className="flex items-center justify-between gap-4">
                  <dt className="min-w-0 break-words">{shortcut.label}</dt>
                  <dd dir="ltr" className="flex shrink-0 flex-wrap gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd key={key} className="rounded border border-border bg-muted px-2 py-1 font-mono text-xs">
                        {key}
                      </kbd>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
            <label className="mt-5 flex min-h-11 cursor-pointer flex-col items-start gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
              <input
                type="checkbox"
                checked={enabled}
                onFocus={(event) => {
                  const input = event.currentTarget;
                  // Safari can finish native focus scrolling before enlarged text
                  // reflows. Keep the focused setting inside its own scrollport.
                  requestAnimationFrame(() => {
                    const scrollport = input.parentElement?.parentElement;
                    if (!scrollport || !input.isConnected) return;
                    const control = input.getBoundingClientRect();
                    const visible = scrollport.getBoundingClientRect();
                    if (control.bottom > visible.bottom) scrollport.scrollTop += control.bottom - visible.bottom + 8;
                    else if (control.top < visible.top) scrollport.scrollTop -= visible.top - control.top + 8;
                  });
                }}
                onChange={(event) => setCharacterShortcutsEnabled(event.target.checked)}
                className="size-5 shrink-0 accent-primary focus-visible:ring-[3px] focus-visible:ring-ring"
              />
              <span className="min-w-0 break-words text-sm">{t(language, "reader.characterShortcuts")}</span>
            </label>
            <p className="mt-2 text-sm text-muted-foreground">{t(language, "reader.shortcutSafety")}</p>
          </div>
        </div>
      </ResponsiveSheet>
    </>
  );
}
