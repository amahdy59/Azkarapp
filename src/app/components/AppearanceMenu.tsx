import type { AppLanguage, RoutineMode, TextSizeOption } from "../types";
import { t } from "../i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ReaderOptionsDivider } from "./ReaderOptions";

export function AppearanceMenu({
  triggerClass,
  textSize,
  onTextSizeChange,
  language,
  direction,
  routineMode,
  onRoutineModeChange,
  isRoutine = false,
  testIdPrefix = "reader",
}: {
  triggerClass: string;
  textSize: TextSizeOption;
  onTextSizeChange: (size: TextSizeOption) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  routineMode?: RoutineMode;
  onRoutineModeChange?: (mode: RoutineMode) => void;
  isRoutine?: boolean;
  testIdPrefix?: string;
}) {
  return (
    <DropdownMenu dir={direction}>
      <DropdownMenuTrigger
        data-testid={`${testIdPrefix}-settings-button`}
        aria-label={t(language, "appearance.title")}
        className={triggerClass}
      >
        <span className="text-sm font-bold tracking-tight" aria-hidden="true">
          Aa
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        data-testid={`${testIdPrefix}-appearance-menu`}
        style={{ width: "max-content", minWidth: "12rem", maxWidth: "calc(100vw - 16px)" }}
      >
        <DropdownMenuLabel>{t(language, "settings.textSize")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={textSize}
          onValueChange={(value) => onTextSizeChange(value as TextSizeOption)}
          aria-label={t(language, "settings.textSize")}
        >
          {(["small", "medium", "large"] as const).map((size) => (
            <DropdownMenuRadioItem
              key={size}
              value={size}
              onSelect={(event) => event.preventDefault()}
              data-testid={`${testIdPrefix}-display-text-size-${size}`}
            >
              {t(
                language,
                size === "small" ? "settings.textSmall" : size === "large" ? "settings.textLarge" : "settings.medium",
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {isRoutine && onRoutineModeChange && (
          <>
            <ReaderOptionsDivider />
            <DropdownMenuLabel>{t(language, "reader.collectionMode")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={routineMode}
              onValueChange={(value) => onRoutineModeChange(value as RoutineMode)}
              aria-label={t(language, "reader.collectionMode")}
            >
              <DropdownMenuRadioItem value="complete" onSelect={(event) => event.preventDefault()}>
                {t(language, "category.complete")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="core" onSelect={(event) => event.preventDefault()}>
                {t(language, "category.core")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
