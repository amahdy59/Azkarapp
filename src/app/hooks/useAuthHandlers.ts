import { useState } from "react";
import type { AppLanguage, AppStateSnapshot, View } from "../types";
import {
  loadRemoteState,
  normalizePhoneNumber,
  profileFromSession,
  requestPhoneOtp,
  resendPhoneOtp,
  signOutSupabase,
  verifyPhoneOtp,
} from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase";
import { clearPrivateAppData } from "../state";
import { t } from "../i18n";

export interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  destructive?: boolean;
}

export function useAuthHandlers({
  selectedLang,
  lastPhoneNumber,
  setLastPhoneNumber,
  setDisplayName: _setDisplayName,
  setIsGuest: _setIsGuest,
  setRemoteSyncReady,
  appStateSnapshot,
  applyStateSnapshot,
  markOnboardingComplete,
  showConfirm,
  setPendingConfirm,
  setView,
  setActiveTab,
}: {
  selectedLang: AppLanguage;
  lastPhoneNumber: string;
  setLastPhoneNumber: (phone: string) => void;
  setDisplayName: (name: string) => void;
  setIsGuest: (isGuest: boolean) => void;
  setRemoteSyncReady: (ready: boolean) => void;
  appStateSnapshot: AppStateSnapshot;
  applyStateSnapshot: (state: AppStateSnapshot) => void;
  markOnboardingComplete: () => void;
  showConfirm: (
    title: string,
    description: string,
    confirmLabel: string,
    cancelLabel: string,
    onConfirm: () => void,
    destructive?: boolean,
  ) => void;
  setPendingConfirm: React.Dispatch<React.SetStateAction<ConfirmDialogOptions | null>>;
  setView: (view: View) => void;
  setActiveTab: (tab: "home" | "azkar" | "progress" | "settings") => void;
}) {
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleOpenAccountAuth = () => {
    setAuthError("");
    setView("login");
    setActiveTab("settings");
  };

  const handleSendOtp = async (phone: string) => {
    try {
      setAuthError("");
      setIsSendingOtp(true);
      const normalizedPhone = isSupabaseConfigured ? await requestPhoneOtp(phone) : normalizePhoneNumber(phone);
      setLastPhoneNumber(normalizedPhone);
      setView("otp");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t(selectedLang, "auth.sendCodeError"));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (token: string) => {
    try {
      setAuthError("");
      setIsVerifyingOtp(true);
      setRemoteSyncReady(false);
      const session = await verifyPhoneOtp(lastPhoneNumber, token);
      if (!session) {
        throw new Error(t(selectedLang, "auth.verifyCodeError"));
      }

      const privateGuestDataExists =
        appStateSnapshot.sessions.length > 0 ||
        appStateSnapshot.dailyCompletions.length > 0 ||
        appStateSnapshot.savedZikrIds.length > 0 ||
        Object.values(appStateSnapshot.completed).some((items) => items.length > 0);
      const legacyIdentityMatches =
        !appStateSnapshot.profile.accountUserId &&
        !appStateSnapshot.profile.isGuest &&
        Boolean(session.user.phone) &&
        normalizePhoneNumber(appStateSnapshot.profile.lastPhoneNumber) ===
          normalizePhoneNumber(session.user.phone ?? "");
      let hydrationBase = appStateSnapshot;
      if (appStateSnapshot.profile.accountUserId && appStateSnapshot.profile.accountUserId !== session.user.id) {
        hydrationBase = clearPrivateAppData(appStateSnapshot);
      } else if (
        !appStateSnapshot.profile.accountUserId &&
        !appStateSnapshot.profile.isGuest &&
        !legacyIdentityMatches
      ) {
        hydrationBase = clearPrivateAppData(appStateSnapshot);
      } else if (
        !appStateSnapshot.profile.accountUserId &&
        appStateSnapshot.profile.isGuest &&
        privateGuestDataExists
      ) {
        await new Promise<void>((resolve) => {
          showConfirm(
            t(selectedLang, "auth.mergeTitle"),
            t(selectedLang, "auth.mergeGuestProgress"),
            t(selectedLang, "auth.mergeConfirm"),
            t(selectedLang, "common.skip"),
            () => resolve(),
            false,
          );
          setPendingConfirm((prev) =>
            prev
              ? {
                  ...prev,
                  onConfirm: () => resolve(),
                }
              : null,
          );
        }).catch(() => {
          hydrationBase = clearPrivateAppData(appStateSnapshot);
        });
      }

      if (hydrationBase !== appStateSnapshot) {
        hydrationBase = {
          ...hydrationBase,
          profile: profileFromSession(session, hydrationBase.profile.lastPhoneNumber),
        };
        applyStateSnapshot(hydrationBase);
      }

      const mergedState = await loadRemoteState(session, hydrationBase);
      applyStateSnapshot(mergedState);
      setRemoteSyncReady(true);
      markOnboardingComplete();
      setView("home");
      setActiveTab("home");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t(selectedLang, "auth.verifyCodeError"));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setAuthError("");
      setIsResendingOtp(true);
      await resendPhoneOtp(lastPhoneNumber);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : t(selectedLang, "auth.resendCodeError"));
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleSignOut = async () => {
    showConfirm(
      t(selectedLang, "auth.signOutTitle"),
      t(selectedLang, "auth.signOutConfirm"),
      t(selectedLang, "auth.signOut"),
      t(selectedLang, "common.cancel"),
      async () => {
        try {
          setAuthError("");
          setRemoteSyncReady(false);
          if (isSupabaseConfigured) {
            await signOutSupabase();
          }
          applyStateSnapshot(clearPrivateAppData(appStateSnapshot));
          setView("login");
          setActiveTab("home");
        } catch (error) {
          setAuthError(error instanceof Error ? error.message : t(selectedLang, "auth.signOutError"));
        }
      },
      true,
    );
  };

  return {
    isSendingOtp,
    isVerifyingOtp,
    isResendingOtp,
    authError,
    setAuthError,
    handleOpenAccountAuth,
    handleSendOtp,
    handleVerifyOtp,
    handleResendOtp,
    handleSignOut,
  };
}
