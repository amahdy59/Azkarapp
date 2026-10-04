import type { ReactNode } from "react";
import type { AppLanguage } from "../types";
import { ReferenceCopyButton } from "./ReferenceCopyButton";
import { ExternalLink } from "./icons";
import { t } from "../i18n";

export interface ReferenceCardProps {
  title?: string;
  titleBadge?: ReactNode;
  titleHeadingId?: string;
  body: string;
  bodyTestId?: string;
  copyable?: boolean;
  copyText?: string;
  copyAriaLabel?: string;
  sourceText?: string;
  sourceUrl?: string;
  sourceTestId?: string;
  sourceHeadingId?: string;
  language: AppLanguage;
  direction?: "ltr" | "rtl";
  isArabicText?: boolean;
  className?: string;
}

export function ReferenceCard({
  title,
  titleBadge,
  titleHeadingId,
  body,
  bodyTestId,
  copyable = false,
  copyText,
  copyAriaLabel,
  sourceText,
  sourceUrl,
  sourceTestId,
  sourceHeadingId,
  language,
  direction,
  isArabicText = false,
  className = "",
}: ReferenceCardProps) {
  const dir = isArabicText ? "rtl" : (direction ?? "auto");
  const lang = isArabicText ? "ar" : language;

  return (
    <article className={`rounded-2xl border border-border/70 bg-card/80 p-4 text-start ${className}`.trim()}>
      {title ? (
        <>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 id={titleHeadingId} className="text-subtitle font-bold text-primary flex items-center gap-2">
              {title}
              {titleBadge}
            </h3>
            {copyable && <ReferenceCopyButton text={copyText ?? body} language={language} ariaLabel={copyAriaLabel} />}
          </div>
          <p
            data-testid={bodyTestId}
            className={`text-subtitle font-bold leading-7 text-foreground ${isArabicText ? "zikr-text" : ""}`}
            dir={dir}
            lang={lang}
          >
            {body}
          </p>
        </>
      ) : (
        <div className="flex items-start justify-between gap-2 mb-2">
          <p
            data-testid={bodyTestId}
            className={`text-subtitle font-bold leading-7 text-foreground flex-1 ${isArabicText ? "zikr-text" : ""}`}
            dir={dir}
            lang={lang}
          >
            {body}
          </p>
          {copyable && <ReferenceCopyButton text={copyText ?? body} language={language} ariaLabel={copyAriaLabel} />}
        </div>
      )}

      {sourceText && (
        <div className="mt-2">
          {sourceHeadingId && (
            <h3 id={sourceHeadingId} className="sr-only">
              {t(language, "reader.sourceLabel")}
            </h3>
          )}
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              dir={direction ?? "auto"}
              lang={language}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl text-label font-black text-primary hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <span data-testid={sourceTestId}>{sourceText}</span>
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          ) : (
            <span
              data-testid={sourceTestId}
              className="inline-flex min-h-11 items-center text-label font-black text-primary"
              dir={direction ?? "auto"}
              lang={language}
            >
              {sourceText}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
