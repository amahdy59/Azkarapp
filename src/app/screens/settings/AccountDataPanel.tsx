import type { ReactNode } from "react";
import { Database, Download, LogOut, RotateCcw, User, Wifi } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { SectionLabel, SubHeader } from "./SettingsPrimitives";

export function AccountDataPanel({
  language,
  isGuest,
  isSyncing,
  syncError,
  sessionCount,
  savedCount,
  onActivateAccount,
  onSignOut,
  onExportData,
  onResetPreferences,
  onClearLocalData,
  onBack,
}: {
  language: AppLanguage;
  isGuest: boolean;
  isSyncing: boolean;
  syncError: string;
  sessionCount: number;
  savedCount: number;
  onActivateAccount: () => void;
  onSignOut: () => void;
  onExportData: () => void;
  onResetPreferences: () => void;
  onClearLocalData: () => void;
  onBack: () => void;
}) {
  const syncStatus = syncError
    ? t(language, "accountData.needsAttention")
    : isSyncing
      ? t(language, "accountData.syncing")
      : t(language, "accountData.upToDate");

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <SubHeader title={t(language, "accountData.title")} onBack={onBack} language={language} />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <section className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {isGuest ? <User size={22} aria-hidden="true" /> : <Wifi size={22} aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-semibold text-foreground">
                {t(language, isGuest ? "accountData.guestTitle" : "accountData.signedInTitle")}
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                {t(language, isGuest ? "accountData.guestBody" : "accountData.signedInBody")}
              </p>
              {!isGuest && (
                <p className="mt-2 text-[12px] font-semibold text-foreground">
                  {t(language, "accountData.syncStatus")}: {syncStatus}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={isGuest ? onActivateAccount : onSignOut}
            className={`mt-4 min-h-11 w-full rounded-xl px-4 text-[14px] font-semibold ${
              isGuest ? "bg-primary text-primary-foreground" : "border border-destructive/60 text-destructive"
            }`}
          >
            {t(language, isGuest ? "accountData.signIn" : "accountData.signOut")}
          </button>
        </section>

        <SectionLabel label={t(language, "accountData.yourData")} />
        <section className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[13px] leading-5 text-muted-foreground">{t(language, "accountData.dataSummary")}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <DataCount label={t(language, "accountData.sessions")} value={sessionCount} />
            <DataCount label={t(language, "accountData.savedItems")} value={savedCount} />
          </dl>
        </section>

        <div className="mt-4 flex flex-col gap-3">
          <DataAction
            icon={<Download size={20} aria-hidden="true" />}
            title={t(language, "accountData.exportTitle")}
            body={t(language, "accountData.exportBody")}
            action={t(language, "accountData.exportAction")}
            onPress={onExportData}
          />
          <DataAction
            icon={<RotateCcw size={20} aria-hidden="true" />}
            title={t(language, "accountData.preferencesTitle")}
            body={t(language, "accountData.preferencesBody")}
            action={t(language, "accountData.preferencesAction")}
            onPress={onResetPreferences}
          />
          <DataAction
            icon={<Database size={20} aria-hidden="true" />}
            title={t(language, "accountData.clearTitle")}
            body={t(language, "accountData.clearBody")}
            action={t(language, "accountData.clearAction")}
            onPress={onClearLocalData}
            destructive
          />
        </div>
      </div>
    </div>
  );
}

function DataCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <dt className="text-[12px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-[22px] font-bold text-foreground">{value}</dd>
    </div>
  );
}

function DataAction({
  icon,
  title,
  body,
  action,
  onPress,
  destructive = false,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
          }`}
        >
          {destructive ? <LogOut size={20} aria-hidden="true" /> : icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{body}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onPress}
        className={`mt-3 min-h-11 w-full rounded-xl px-4 text-[13px] font-semibold ${
          destructive ? "border border-destructive/60 text-destructive" : "bg-muted text-foreground"
        }`}
      >
        {action}
      </button>
    </section>
  );
}
