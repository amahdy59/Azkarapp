import type { ComponentProps } from "react";
import { PrayerMomentPanel, PRAYER_ICON } from "./PrayerMomentPanel";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { t } from "../i18n";
import { prayerDisplayName } from "../prayerPresentation";
import { Button } from "./ui/button";

/** The existing prayer journey, with one protected overlay and no draft state. */
export function PrayerTrackingDialog({
  onClose,
  ...props
}: Omit<ComponentProps<typeof PrayerMomentPanel>, "onGlass" | "inDialog"> & {
  onClose: () => void;
}) {
  const Icon = PRAYER_ICON[props.prayer];
  const title = t(props.language, "prayerActions.heading", {
    prayer: prayerDisplayName(props.prayer, props.language, props.dayKey),
  });
  return (
    <ResponsiveSheet
      open
      protectedSurface
      focusOnOpen
      onClose={onClose}
      title={title}
      language={props.language}
      direction={props.direction}
      testId="home-prayer-moment"
      maxWidthClassName="max-w-5xl"
      dialogClassName="prayer-tracking-dialog"
      drawerClassName="prayer-tracking-dialog"
    >
      <SheetHeader
        title={title}
        icon={<Icon size={22} aria-hidden="true" />}
        onClose={onClose}
        language={props.language}
        direction={props.direction}
        className="prayer-tracking-header"
      />
      <div className="prayer-tracking-body" data-prayer={props.prayer}>
        <PrayerMomentPanel {...props} inDialog />
      </div>
      <footer className="prayer-tracking-footer">
        <p>{t(props.language, "home.prayerAutoSave")}</p>
        <Button type="button" onClick={onClose}>
          {t(props.language, "home.prayerTrackingDone")}
        </Button>
      </footer>
    </ResponsiveSheet>
  );
}
