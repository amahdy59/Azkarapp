import { lazy, Suspense } from "react";
import type { AudioController } from "../audio/AudioProvider";
import type { AppLanguage, DailyCollectionCompletion } from "../types";
import type { ConfirmDialogOptions, GuestMigrationDecision } from "../hooks/useAuthHandlers";
import { t } from "../i18n";
import { ConfirmDialog } from "./ConfirmDialog";
import { ScreenFallback } from "./ScreenFallback";

const ProgressShareModal = lazy(() =>
  import("./ProgressShareModal").then((module) => ({ default: module.ProgressShareModal })),
);
const AudioContentReviewScreen = lazy(() =>
  import("../screens/AudioContentReviewScreen").then((module) => ({ default: module.AudioContentReviewScreen })),
);

export function AppModalHost({
  language,
  dailyCompletions,
  progressDayStartHour,
  showShareModal,
  onCloseShareModal,
  showAudioReview,
  onCloseAudioReview,
  audioController,
  guestMigrationOpen,
  resolveGuestMigration,
  pendingConfirm,
  onClearPendingConfirm,
}: {
  language: AppLanguage;
  dailyCompletions: DailyCollectionCompletion[];
  progressDayStartHour: number;
  showShareModal: boolean;
  onCloseShareModal: () => void;
  showAudioReview: boolean;
  onCloseAudioReview: () => void;
  audioController: AudioController | null;
  guestMigrationOpen: boolean;
  resolveGuestMigration: (decision: GuestMigrationDecision) => void;
  pendingConfirm: ConfirmDialogOptions | null;
  onClearPendingConfirm: () => void;
}) {
  return (
    <>
      {showShareModal && (
        <ProgressShareModal
          dailyCompletions={dailyCompletions}
          progressDayStartHour={progressDayStartHour}
          language={language}
          onClose={onCloseShareModal}
        />
      )}

      {import.meta.env.DEV && showAudioReview && (
        <Suspense fallback={<ScreenFallback language={language} />}>
          <AudioContentReviewScreen
            onClose={() => {
              audioController?.stop();
              onCloseAudioReview();
            }}
          />
        </Suspense>
      )}

      {guestMigrationOpen && (
        <ConfirmDialog
          open
          title={t(language, "auth.guestProgressTitle")}
          description={t(language, "auth.guestProgressBody")}
          confirmLabel={t(language, "auth.mergeGuestProgress")}
          secondaryLabel={t(language, "auth.discardGuestProgress")}
          cancelLabel={t(language, "auth.cancelGuestMigration")}
          onConfirm={() => resolveGuestMigration("merge")}
          onSecondary={() => resolveGuestMigration("discard")}
          onCancel={() => resolveGuestMigration("cancel")}
        />
      )}

      {pendingConfirm && (
        <ConfirmDialog
          open
          title={pendingConfirm.title}
          description={pendingConfirm.description}
          confirmLabel={pendingConfirm.confirmLabel}
          cancelLabel={pendingConfirm.cancelLabel}
          destructive={pendingConfirm.destructive}
          onConfirm={async () => {
            await pendingConfirm.onConfirm();
            onClearPendingConfirm();
          }}
          onCancel={onClearPendingConfirm}
        />
      )}
    </>
  );
}
