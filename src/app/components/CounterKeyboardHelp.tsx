import { useEffect, useState } from "react";
import {
  isCounterShortcutBlocked,
  setCharacterShortcutsEnabled,
  useCharacterShortcutsEnabled,
} from "../keyboardShortcuts";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import type { CounterShortcut } from "./ZikrComponents";
import { Modal } from "./ResponsiveSheet";
import { Button } from "./ui/button";

export function CounterKeyboardHelp({
  shortcuts,
  language,
  direction,
}: {
  shortcuts: readonly CounterShortcut[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
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
      <Button type="button" variant="ghost" onClick={() => setOpen(true)} className="mx-auto mt-1 flex">
        {t(language, "reader.keyboardShortcuts")}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t(language, "reader.keyboardShortcuts")}
        language={language}
        direction={direction}
        testId="counter-keyboard-help"
        className="h-[85vh] p-5 sm:h-auto sm:p-6"
      >
        <div aria-hidden="true" className="h-12 shrink-0 sm:hidden" />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <h2 className="text-lg font-bold sm:pe-12">{t(language, "reader.keyboardShortcuts")}</h2>
          <dl className="mt-4 space-y-3">
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
              onChange={(event) => setCharacterShortcutsEnabled(event.target.checked)}
              className="size-5 shrink-0 accent-primary focus-visible:ring-[3px] focus-visible:ring-ring"
            />
            <span className="min-w-0 break-words text-sm">{t(language, "reader.characterShortcuts")}</span>
          </label>
          <p className="mt-2 text-sm text-muted-foreground">{t(language, "reader.shortcutSafety")}</p>
        </div>
      </Modal>
    </>
  );
}
