import { Bell, MapPin } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import {
  RowChevron,
  RowValue,
  SettingsRowItem,
  SettingsSection,
  SubHeader,
  useSettingsReturnFocus,
} from "./SettingsPrimitives";
export function PrayerSettingsPanel({
  language,
  cityName,
  onNav,
  onBack,
  focusOnMount,
}: {
  language: AppLanguage;
  cityName?: string;
  onNav: (panel: "location" | "notifications") => void;
  onBack: () => void;
  focusOnMount?: "location" | "notifications";
}) {
  const panelRef = useSettingsReturnFocus(focusOnMount ? `settings-sub-${focusOnMount}` : undefined);
  return (
    <div ref={panelRef} className="flex h-full min-h-0 flex-col">
      <SubHeader title={t(language, "settings.prayerReminders")} language={language} onBack={onBack} />
      <div className="flex-1 overflow-y-auto pb-8">
        <SettingsSection className="mt-3">
          <SettingsRowItem
            icon={<MapPin size={20} className="text-primary" />}
            label={t(language, "settings.prayerTimesAndLocation")}
            right={cityName ? <RowValue value={cityName} /> : <RowChevron />}
            onPress={() => onNav("location")}
            testId="settings-sub-location"
          />
          <SettingsRowItem
            icon={<Bell size={20} className="text-primary" />}
            label={t(language, "settings.notificationsAndReminders")}
            right={<RowChevron />}
            onPress={() => onNav("notifications")}
            testId="settings-sub-notifications"
            hasDivider={false}
          />
        </SettingsSection>
      </div>
    </div>
  );
}
