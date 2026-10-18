import { t } from "../i18n";
import type { AppLanguage } from "../types";

/** Visibility follows the same resolved material selector as the page itself. */
export function MushafMaterialHint({ language }: { language: AppLanguage }) {
  return (
    <p
      className="mushaf-material-hint hidden text-sm leading-relaxed text-muted-foreground"
      data-testid="mushaf-material-hint"
    >
      <strong className="font-semibold text-foreground">{t(language, "mushaf.glassActive")}</strong>{" "}
      {t(language, "mushaf.glassColorHint")}
    </p>
  );
}
