import type { AppLanguage } from "../types";
import type { ShareItem } from "../share/shareLayout";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { CollectionShareModal } from "./CollectionShareModal";

interface ShareableCardModalProps {
  palms: number;
  golden: number;
  green: number;
  dateStr: string;
  language: AppLanguage;
  onClose: () => void;
}

/** Milestones use the same image/export boundary as the rest of sharing. */
export function ShareableCardModal({ palms, golden, green, dateStr, language, onClose }: ShareableCardModalProps) {
  const shareItemsByLanguage = Object.fromEntries(
    (["ar", "en"] as const).map((exportLanguage) => [
      exportLanguage,
      [
        {
          id: "recorded-practice",
          title: t(exportLanguage, "shareModal.title"),
          arabicText: [
            `${t(exportLanguage, "shareModal.palmDays")}: ${formatNumerals(palms, exportLanguage)}`,
            `${t(exportLanguage, "shareModal.dailyRoutines")}: ${formatNumerals(golden, exportLanguage)}`,
            `${t(exportLanguage, "shareModal.additionalPractice")}: ${formatNumerals(green, exportLanguage)}`,
            dateStr,
          ].join("\n"),
          textDirection: exportLanguage === "ar" ? "rtl" : "ltr",
          language: exportLanguage,
          hideRepetition: true,
        } satisfies ShareItem,
      ],
    ]),
  ) as Record<AppLanguage, ShareItem[]>;

  return (
    <CollectionShareModal
      open
      single
      initialFormat="portrait"
      contentAlignment="center"
      onClose={onClose}
      dialogTitle={t(language, "shareModal.dialogAria")}
      dialogDescription={t(language, "shareModal.completedSubtitle")}
      collectionTitle={t(language, "shareModal.mayAllahAccept")}
      collectionTitleArabic={t("ar", "shareModal.mayAllahAccept")}
      collectionTitleEnglish={t("en", "shareModal.mayAllahAccept")}
      items={[]}
      shareItemsByLanguage={shareItemsByLanguage}
      shareUrl={new URL(import.meta.env.BASE_URL, window.location.origin).href}
      language={language}
    />
  );
}
