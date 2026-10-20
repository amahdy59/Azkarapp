import { DevotionalAction } from "./DevotionalControls";
import { Headphones, Lightbulb, Maximize, Share2 } from "./icons";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import "./reader-footer.css";

/** The actual footer anatomy, without interactive actions or reading state. */
export function ReaderFooterPreview({ language }: { language: AppLanguage }) {
  return (
    <div className="reader-footer-preview-stage reader-dock" data-testid="reader-footer-preview" aria-hidden="true">
      <div className="reader-footer-composition">
        <div className="reader-tools-row">
          {(
            [
              [Lightbulb, "reader.referencesButton"],
              [Headphones, "reader.menuAudio"],
              [Share2, "reader.shareAction"],
              [Maximize, "reader.focusShort"],
            ] as const
          ).map(([Icon, key]) => (
            <DevotionalAction key={key} disabled className="disabled:opacity-100">
              <Icon size={20} aria-hidden="true" />
              <span className="reader-tool-label text-label font-semibold">{t(language, key)}</span>
            </DevotionalAction>
          ))}
        </div>
      </div>
    </div>
  );
}
