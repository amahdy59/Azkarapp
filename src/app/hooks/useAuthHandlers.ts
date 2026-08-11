import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { AppLanguage, AppStateSnapshot, View } from "../types";
import {
  getCurrentSession,
  loadRemoteState,
  profileFromSession,
  requestEmailOtp,
  resendEmailOtp,
  signInWithOAuthProvider,
  signOutSupabase,
  updateAccountDisplayName,
  verifyEmailOtp,
} from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase";
import { clearPrivateAppData } from "../state";
import { t } from "../i18n";
import { reportError } from "../../lib/observability";

export type GuestMigrationDecision = "merge" | "discard" | "cancel";

export interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
}

type AuthErrorShape = { code?: unknown; status?: unknown; name?: unknown };

export function getSafeAuthErrorMessage(error: unknown, language: AppLanguage, fallbackKey: string) {
  const value = error as AuthErrorShape | null;
  const code = typeof value?.code === "string" ? value.code : "";
  const status = typeof value?.status === "number" ? value.status : 0;

  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || status === 429) {
    return t(language, "auth.rateLimitedError");
  }
  if (["otp_expired", "flow_state_expired", "flow_state_not_found", "bad_code_verifier"].includes(code)) {
    return t(language, "auth.sessionExpiredError");
  }
  if (["provider_disabled", "oauth_provider_not_supported", "email_provider_disabled", "otp_disabled"].includes(code)) {
    return t(language, "auth.providerUnavailableError");
  }
  if (code === "email_not_confirmed") return t(language, "auth.emailNotConfirmedError");
  if (status >= 500 || value?.name === "AuthRetryableFetchError" || error instanceof TypeError) {
    return t(language, "auth.serviceUnavailableError");
  }
  return t(language, fallbackKey);
}

export function hasPrivateProgress(state: AppStateSnapshot) {
  return (
    state.sessions.length > 0 ||
    state.dailyCompletions.length > 0 ||
    state.savedZikrIds.length > 0 ||
    Object.values(state.completed).some((items) => items.length > 0)
  );
}

export async function prepareAuthenticatedState(
  session: Session,
  localState: AppStateSnapshot,
  requestGuestMigrationDecision: () => Promise<GuestMigrationDecision>,
) {
  const knownDifferentOwner =
    Boolean(localState.profile.accountUserId) && localState.profile.accountUserId !== session.user.id;

  let decision: GuestMigrationDecision = "merge";
  if (!localState.profile.accountUserId && localState.profile.isGuest && hasPrivateProgress(localState)) {
    decision = await requestGuestMigrationDecision();
  }
  if (decision === "cancel") {
    await signOutSupabase();
    return null;
  }

  const mayUseLocalPrivateData = !knownDifferentOwner && decision === "merge";
  const base = mayUseLocalPrivateData ? localState : clearPrivateAppData(localState);
  return {
    ...base,
    profile: profileFromSession(session, base.profile),
  };
}

export function useAuthHandlers({
  selectedLang,
  email,
  setEmail,
  setRemoteSyncReady,
  appStateSnapshot,
  applyStateSnapshot,
  markOnboardingComplete,
  requestGuestMigrationDecision,
  showConfirm,
  setView,
  setActiveTab,
}: {
  selectedLang: AppLanguage;
  email: string;
  setEmail: (email: string) => void;
  setRemoteSyncReady: (ready: boolean) => void;
  appStateSnapshot: AppStateSnapshot;
  applyStateSnapshot: (state: AppStateSnapshot) => void;
  markOnboardingComplete: () => void;
  requestGuestMigrationDecision: () => Promise<GuestMigrationDecision>;
  showConfirm: (
    title: string,
    description: string,
    confirmLabel: string,
    cancelLabel: string,
    onConfirm: () => void | Promise<void>,
    destructive?: boolean,
  ) => void;
  setView: (view: View) => void;
  setActiveTab: (tab: "home" | "azkar" | "progress" | "settings") => void;
}) {
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const [isAuthenticatingOAuth, setIsAuthenticatingOAuth] = useState(false);
  const [authError, setAuthError] = useState("");

  const finishSession = async (session: Session) => {
    setRemoteSyncReady(false);
    const hydrationBase = await prepareAuthenticatedState(session, appStateSnapshot, requestGuestMigrationDecision);
    if (!hydrationBase) {
      setView("home");
      return;
    }
    applyStateSnapshot(hydrationBase);
    const mergedState = await loadRemoteState(session, hydrationBase, {
      preserveLocalPreferences: appStateSnapshot.profile.isGuest,
    });
    applyStateSnapshot(mergedState);
    setRemoteSyncReady(true);
    markOnboardingComplete();
    const needsName = !mergedState.profile.displayName.trim() || mergedState.profile.displayName === "Guest";
    setView(needsName ? "profile-completion" : "home");
    setActiveTab("home");
  };

  const handleOpenAccountAuth = () => {
    setAuthError("");
    setView("login");
    setActiveTab("settings");
  };

  const handleSendOtp = async (value: string) => {
    try {
      setAuthError("");
      setIsSendingOtp(true);
      const normalizedEmail = await requestEmailOtp(value);
      setEmail(normalizedEmail);
      setView("otp");
    } catch (error) {
      reportError(error, "auth-send-otp");
      setAuthError(getSafeAuthErrorMessage(error, selectedLang, "auth.sendCodeError"));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (token: string) => {
    try {
      setAuthError("");
      setIsVerifyingOtp(true);
      const session = await verifyEmailOtp(email, token);
      if (!session) throw new Error(t(selectedLang, "auth.verifyCodeError"));
      await finishSession(session);
    } catch (error) {
      reportError(error, "auth-verify-otp");
      setAuthError(getSafeAuthErrorMessage(error, selectedLang, "auth.verifyCodeError"));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setAuthError("");
      setIsResendingOtp(true);
      await resendEmailOtp(email);
    } catch (error) {
      reportError(error, "auth-resend-otp");
      setAuthError(getSafeAuthErrorMessage(error, selectedLang, "auth.resendCodeError"));
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    try {
      setAuthError("");
      setIsAuthenticatingOAuth(true);
      await signInWithOAuthProvider(provider);
    } catch (error) {
      reportError(error, `auth-oauth-${provider}`);
      setAuthError(getSafeAuthErrorMessage(error, selectedLang, "auth.verifyCodeError"));
    } finally {
      setIsAuthenticatingOAuth(false);
    }
  };

  const handleAuthCallback = async () => {
    try {
      setAuthError("");
      const params = new URLSearchParams(window.location.search);
      const callbackError = params.get("error_description") || params.get("error");
      if (callbackError) throw new Error(callbackError);
      const session = await getCurrentSession();
      if (!session) throw new Error(t(selectedLang, "auth.verifyCodeError"));
      await finishSession(session);
    } catch (error) {
      reportError(error, "auth-callback");
      setAuthError(getSafeAuthErrorMessage(error, selectedLang, "auth.verifyCodeError"));
      setView("login");
    } finally {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.search = "";
      cleanUrl.hash = "";
      window.history.replaceState({ view: "home" }, "", cleanUrl);
    }
  };

  const handleCompleteProfile = async (displayName: string) => {
    try {
      setAuthError("");
      setIsCompletingProfile(true);
      await updateAccountDisplayName(displayName);
      applyStateSnapshot({
        ...appStateSnapshot,
        profile: { ...appStateSnapshot.profile, displayName: displayName.trim() },
      });
      setView("home");
    } catch (error) {
      reportError(error, "auth-profile-save");
      setAuthError(getSafeAuthErrorMessage(error, selectedLang, "auth.profileSaveError"));
    } finally {
      setIsCompletingProfile(false);
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
          if (isSupabaseConfigured) await signOutSupabase();
          applyStateSnapshot(clearPrivateAppData(appStateSnapshot));
          setView("login");
          setActiveTab("home");
        } catch (error) {
          reportError(error, "auth-sign-out");
          setAuthError(getSafeAuthErrorMessage(error, selectedLang, "auth.signOutError"));
          throw new Error(t(selectedLang, "auth.signOutError"), { cause: error });
        }
      },
      true,
    );
  };

  return {
    isSendingOtp,
    isVerifyingOtp,
    isResendingOtp,
    isCompletingProfile,
    isAuthenticatingOAuth,
    authError,
    setAuthError,
    handleOpenAccountAuth,
    handleSendOtp,
    handleVerifyOtp,
    handleResendOtp,
    handleOAuth,
    handleAuthCallback,
    handleCompleteProfile,
    handleSignOut,
  };
}
