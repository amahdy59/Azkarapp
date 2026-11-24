import type { PrayerInfoData } from "../content/prayerActions";
import type { SunnahEvidence } from "../content/prayerSunnah";
import type { AppLanguage } from "../types";

interface GuidanceProps {
  info: PrayerInfoData;
  language: AppLanguage;
  onGlass: boolean;
}

/** Complete existing quotations and passive references; never an extra disclosure. */
export function PrayerEvidenceQuote({
  source,
  language,
  onGlass,
  sourceTestId,
}: Omit<GuidanceProps, "info"> & { source: SunnahEvidence; sourceTestId?: string }) {
  const arabic = language === "ar" || !source.textEnglish;
  const grading = language === "ar" ? source.gradingArabic : source.gradingEnglish;
  return (
    <blockquote className="prayer-sunnah-evidence">
      <p
        className={`text-base font-semibold ${onGlass ? "text-on-media" : "text-foreground"}`}
        dir={arabic ? "rtl" : "ltr"}
        lang={arabic ? "ar" : "en"}
      >
        {arabic ? source.textArabic : source.textEnglish}
      </p>
      <footer
        className={`mt-2 text-xs leading-relaxed ${onGlass ? "text-on-media-muted" : "text-muted-foreground"}`}
        dir="auto"
      >
        <span data-testid={sourceTestId}>{language === "ar" ? source.referenceArabic : source.referenceEnglish}</span>
        {grading && <span className="block">{grading}</span>}
      </footer>
    </blockquote>
  );
}

/** The daily foundation follows the recorded actions in the same column. */
export function PrayerRawatibDetails({ info, language, onGlass }: GuidanceProps) {
  if (!info.rawatibVirtue) return null;
  const headingId = `prayer-rawatib-heading-${info.prayer}`;
  return (
    <section
      className="prayer-sunnah-details prayer-rawatib-details"
      data-testid="rawatib-virtue-banner"
      aria-labelledby={headingId}
    >
      <h3
        id={headingId}
        className={`text-base font-semibold leading-normal ${onGlass ? "text-on-media" : "text-foreground"}`}
        dir="auto"
      >
        {info.rawatibVirtue.title}
      </h3>
      <p
        className={`text-label leading-relaxed ${onGlass ? "text-on-media-muted" : "text-muted-foreground"}`}
        dir="auto"
      >
        {info.rawatibVirtue.description}
      </p>
      <PrayerEvidenceQuote source={info.rawatibVirtue.evidence} language={language} onGlass={onGlass} />
    </section>
  );
}

/** Prayer-specific guidance flows directly after its virtue in the reading column. */
export function PrayerSunnahDetails({ info, language, onGlass }: GuidanceProps) {
  const headingId = `prayer-sunnah-heading-${info.prayer}`;
  return (
    <section className="prayer-sunnah-details" aria-labelledby={headingId} data-testid="prayer-inline-info">
      <h3
        id={headingId}
        className={`text-base font-semibold leading-normal ${onGlass ? "text-on-media" : "text-foreground"}`}
        dir="auto"
      >
        {info.modalTitle}
      </h3>
      <ul className="prayer-sunnah-points" data-testid="prayer-info-points">
        {info.sunnahItems.map((item, index) => (
          <li key={`${item.position}-${index}`} className="prayer-sunnah-point">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1" dir="auto">
              <h4 className={`text-sm font-semibold leading-normal ${onGlass ? "text-on-media" : "text-foreground"}`}>
                {item.title} · {item.rakahsLabel}
              </h4>
              <span
                className={`text-xs font-medium leading-relaxed ${onGlass ? "text-on-media-muted" : "text-muted-foreground"}`}
              >
                {item.rankLabel}
              </span>
            </div>
            <p
              className={`text-label leading-relaxed ${onGlass ? "text-on-media-muted" : "text-muted-foreground"}`}
              dir="auto"
            >
              {item.description}
            </p>
            {item.sunnah.evidence.textArabic !== info.rawatibVirtue?.evidence.textArabic && (
              <PrayerEvidenceQuote source={item.sunnah.evidence} language={language} onGlass={onGlass} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
