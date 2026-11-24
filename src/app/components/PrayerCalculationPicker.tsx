import { useId, useRef, useState } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { useLayoutMode } from "../hooks/useLayoutMode";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { ChoiceRadioItem } from "./ChoiceRadioItem";
import { ChevronDown } from "./icons";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import "./prayer-settings.css";

export interface PrayerCalculationOption {
  id: number;
  label: string;
  shortLabel: string;
}

/** Presentation only: the settings screen owns applying and saving the method. */
export function PrayerCalculationPicker({
  language,
  options,
  value,
  onChange,
}: {
  language: AppLanguage;
  options: readonly PrayerCalculationOption[];
  value: number;
  onChange: (value: number) => void;
}) {
  const compact = useLayoutMode() === "compact";
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const direction = language === "ar" ? "rtl" : "ltr";
  const selected = options.find((option) => option.id === value) ?? options[0];
  const close = () => setOpen(false);
  const select = (next: number) => {
    onChange(next);
    close();
  };

  return (
    <div ref={root} className="space-y-2">
      <h2 id={`${id}-label`} className="text-title font-bold text-foreground">
        {t(language, "prayerLocation.methodTitle")}
      </h2>
      {compact ? (
        <button
          id="calculation-method-select"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={`${id}-label ${id}-value`}
          aria-describedby={`${id}-full`}
          onClick={(event) => {
            event.currentTarget.focus({ preventScroll: true });
            setOpen(true);
          }}
          className="prayer-method-trigger flex min-h-12 w-full items-center justify-between gap-3 rounded-[var(--ds-radius-control)] border border-border-control bg-background px-3 py-3 text-start text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <span id={`${id}-value`} className="min-w-0">
            {selected?.shortLabel}
          </span>
          <ChevronDown size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      ) : (
        <Select value={String(value)} onValueChange={(next) => onChange(Number(next))} dir={direction}>
          <SelectTrigger
            id="calculation-method-select"
            aria-labelledby={`${id}-label`}
            aria-describedby={`${id}-full`}
            className="prayer-method-trigger text-start font-semibold"
          >
            <SelectValue>{selected?.shortLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent className="prayer-method-popup" collisionPadding={8}>
            {options.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <p id={`${id}-full`} className="text-label leading-relaxed text-muted-foreground">
        {selected?.label}
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">{t(language, "prayerLocation.methodHint")}</p>
      <ResponsiveSheet
        open={open}
        onClose={close}
        title={t(language, "prayerLocation.methodTitle")}
        describedById={`${id}-hint`}
        direction={direction}
        language={language}
        protectedSurface
        focusOnOpen
        testId="prayer-method-sheet"
        drawerClassName="prayer-settings-surface"
        dialogClassName="prayer-settings-surface"
        onCloseAutoFocus={(event) => {
          const opener = root.current?.querySelector<HTMLButtonElement>("#calculation-method-select");
          if (!opener) return;
          event.preventDefault();
          opener.focus({ preventScroll: true });
        }}
      >
        <SheetHeader
          title={t(language, "prayerLocation.methodTitle")}
          language={language}
          onClose={close}
          className="prayer-settings-heading"
        />
        <div className="min-h-0 overflow-y-auto overscroll-contain p-3" data-vaul-no-drag>
          <p id={`${id}-hint`} className="px-2 pb-3 text-label leading-relaxed text-muted-foreground">
            {t(language, "prayerLocation.methodPickerHint")}
          </p>
          <RadioGroup.Root
            value={String(value)}
            onValueChange={(next) => select(Number(next))}
            dir={direction}
            aria-label={t(language, "prayerLocation.methodTitle")}
            className="space-y-1"
          >
            {options.map((option) => (
              <ChoiceRadioItem
                key={option.id}
                value={String(option.id)}
                onClick={() => {
                  if (option.id === value) close();
                }}
                className="min-h-12 w-full justify-start py-4 ps-4 pe-9 text-start leading-relaxed"
              >
                {option.label}
              </ChoiceRadioItem>
            ))}
          </RadioGroup.Root>
        </div>
        <p className="shrink-0 border-t border-border/40 px-5 py-3 text-xs leading-relaxed text-muted-foreground">
          {t(language, "prayerLocation.appliesImmediately")}
        </p>
      </ResponsiveSheet>
    </div>
  );
}
