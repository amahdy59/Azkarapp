import { useEffect, useRef, useState } from "react";
import { ArrowPrevious, Clock } from "../../components/icons";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../components/ui/input-otp";
import { t } from "../../i18n";
import { IconButton } from "../../components/LayoutShells";
import type { AppLanguage } from "../../types";
import { BrandLockup } from "../onboarding/OnboardingBrand";

const termsUrl = (import.meta.env.VITE_TERMS_URL as string | undefined)?.trim() || "";
const privacyUrl = (import.meta.env.VITE_PRIVACY_URL as string | undefined)?.trim() || "";

function LegalConsent({ language, compact = false }: { language: AppLanguage; compact?: boolean }) {
  const ar = language === "ar";
  if (!termsUrl || !privacyUrl) {
    return (
      <p className={`text-center text-muted-foreground ${compact ? "text-[0.625rem]" : "text-[0.6875rem] leading-4"}`}>
        {ar
          ? "سيُتاح تسجيل الدخول بعد نشر شروط الخدمة وسياسة الخصوصية."
          : "Account sign-in will open after the Terms and Privacy Policy are published."}
      </p>
    );
  }
  return (
    <p className={`text-center text-muted-foreground ${compact ? "text-[0.625rem]" : "text-[0.6875rem] leading-4"}`}>
      {ar ? "بالمتابعة، أنت توافق على " : "By continuing you agree to our "}
      <a className="font-semibold text-primary underline" href={termsUrl} target="_blank" rel="noreferrer">
        {ar ? "شروط الخدمة" : "Terms"}
      </a>
      {ar ? " و" : " & "}
      <a className="font-semibold text-primary underline" href={privacyUrl} target="_blank" rel="noreferrer">
        {ar ? "سياسة الخصوصية" : "Privacy Policy"}
      </a>
    </p>
  );
}

function ProviderButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-12 w-full rounded-xl border border-border-control bg-card px-4 text-[0.9375rem] font-semibold text-foreground hover:bg-muted disabled:cursor-wait disabled:opacity-55"
    >
      {label}
    </button>
  );
}

export function LoginScreen({
  language,
  providerFlags,
  onGoogle,
  onEmail,
  onApple,
  onGuest,
  errorMessage = "",
  isAuthenticating = false,
}: {
  language: AppLanguage;
  providerFlags: { google: boolean; email: boolean; apple: boolean };
  onGoogle: () => void;
  onEmail: () => void;
  onApple: () => void;
  onGuest: () => void;
  errorMessage?: string;
  isAuthenticating?: boolean;
}) {
  const ar = language === "ar";
  const legalReady = Boolean(termsUrl) && Boolean(privacyUrl);
  const accountAuthEnabled = legalReady && Object.values(providerFlags).some(Boolean);
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background px-6 pb-7 pt-8" dir={ar ? "rtl" : "ltr"}>
      <div className="flex flex-col items-center gap-7">
        <BrandLockup compact />
        <div className="text-center">
          <h1 className="text-[1.75rem] font-extrabold leading-9 text-foreground">{t(language, "auth.welcome")}</h1>
          <p className="mt-2 text-[0.875rem] leading-[22px] text-muted-foreground">
            {t(language, "auth.syncSubtitle")}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          {providerFlags.google && legalReady && (
            <ProviderButton
              label={ar ? "المتابعة باستخدام Google" : "Continue with Google"}
              onClick={onGoogle}
              disabled={isAuthenticating}
            />
          )}
          {providerFlags.email && legalReady && (
            <ProviderButton
              label={ar ? "المتابعة بالبريد الإلكتروني" : "Continue with Email"}
              onClick={onEmail}
              disabled={isAuthenticating}
            />
          )}
          {providerFlags.apple && legalReady && (
            <ProviderButton
              label={ar ? "المتابعة باستخدام Apple" : "Continue with Apple"}
              onClick={onApple}
              disabled={isAuthenticating}
            />
          )}
          {!accountAuthEnabled && (
            <p className="text-center text-[0.6875rem] leading-4 text-muted-foreground">
              {ar
                ? "تسجيل الدخول غير متاح حالياً؛ يمكنك المتابعة كزائر."
                : "Sign-in is not available yet. You can continue as a guest."}
            </p>
          )}
          {errorMessage && (
            <p
              className="rounded-xl bg-destructive/10 px-3 py-2 text-center text-[0.8125rem] font-semibold text-destructive"
              role="alert"
            >
              {errorMessage}
            </p>
          )}
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-4">
        <button
          data-testid="continue-as-guest"
          type="button"
          onClick={onGuest}
          className="h-12 w-full rounded-xl bg-secondary text-[0.9375rem] font-semibold text-secondary-foreground"
        >
          {t(language, "auth.continueAsGuest")}
        </button>
        <LegalConsent language={language} />
      </div>
    </div>
  );
}

export function EmailInputScreen({
  language,
  initialEmail,
  errorMessage,
  isSending,
  onSend,
  onBack,
  onSkip,
}: {
  language: AppLanguage;
  initialEmail: string;
  errorMessage: string;
  isSending: boolean;
  onSend: (email: string) => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const ar = language === "ar";
  const canSend = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background" dir={ar ? "rtl" : "ltr"}>
      <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-5">
        <IconButton onClick={onBack} label={t(language, "common.back")} className="justify-self-start">
          <ArrowPrevious size={24} className="text-foreground" />
        </IconButton>
        <p className="text-[1.0625rem] font-semibold text-foreground">{t(language, "auth.signIn")}</p>
        <button type="button" onClick={onSkip} className="min-h-11 justify-self-end px-2 text-muted-foreground">
          {t(language, "auth.skip")}
        </button>
      </header>
      <div className="flex flex-col gap-8 px-6 pt-6">
        <div>
          <h1 className="text-[1.5rem] font-extrabold leading-8 text-foreground">
            {ar ? "أدخل بريدك الإلكتروني" : "Enter your email"}
          </h1>
          <p className="mt-2 text-[0.875rem] leading-5 text-muted-foreground">
            {ar ? "سنرسل رمز تحقق مكوّناً من 6 أرقام." : "We’ll send a six-digit verification code."}
          </p>
        </div>
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-[60px] rounded-2xl border-[1.5px] border-primary bg-card px-4 text-[1rem] font-semibold text-foreground outline-none focus:ring-[3px] focus:ring-ring"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          aria-label={ar ? "البريد الإلكتروني" : "Email address"}
          aria-describedby={errorMessage ? "email-error" : undefined}
          aria-invalid={errorMessage ? "true" : undefined}
        />
        {errorMessage && (
          <p id="email-error" className="text-[0.75rem] text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-4 px-6 pb-6">
        <button
          type="button"
          onClick={canSend && !isSending ? () => onSend(email.trim()) : undefined}
          disabled={!canSend || isSending}
          className="h-[52px] w-full rounded-2xl bg-primary text-[1rem] font-bold text-primary-foreground disabled:opacity-45"
        >
          {isSending ? t(language, "common.sending") : t(language, "auth.sendVerificationCode")}
        </button>
        <LegalConsent language={language} compact />
      </div>
    </div>
  );
}

export function OTPScreen({
  language,
  maskedEmail,
  errorMessage,
  isVerifying,
  isResending,
  onVerify,
  onResend,
  onBack,
  onDifferent,
}: {
  language: AppLanguage;
  maskedEmail: string;
  errorMessage: string;
  isVerifying: boolean;
  isResending: boolean;
  onVerify: (token: string) => void;
  onResend: () => void;
  onBack: () => void;
  onDifferent: () => void;
}) {
  const [token, setToken] = useState("");
  const [countdown, setCountdown] = useState(60);
  useEffect(() => {
    const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const ar = language === "ar";
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background" dir={ar ? "rtl" : "ltr"}>
      <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-5">
        <IconButton onClick={onBack} label={t(language, "common.back")} className="justify-self-start">
          <ArrowPrevious size={24} className="text-foreground" />
        </IconButton>
        <p className="text-[1.0625rem] font-semibold text-foreground">{ar ? "تحقق من بريدك" : "Verify your email"}</p>
        <span />
      </header>
      <div className="flex flex-col gap-8 px-6 pt-5">
        <div className="flex flex-col gap-3">
          <p className="text-[0.875rem] text-muted-foreground">
            {ar ? "أرسلنا رمزاً إلى" : "We sent a code to"}{" "}
            <strong className="text-foreground" dir="ltr">
              {maskedEmail}
            </strong>
          </p>
          <div className="flex items-center gap-1.5 text-primary">
            <Clock size={15} />
            <p className="text-[0.875rem] font-semibold">
              {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
            </p>
          </div>
        </div>
        <InputOTP
          maxLength={6}
          value={token}
          onChange={(value) => setToken(value.replace(/\D/g, "").slice(0, 6))}
          containerClassName="w-full justify-center"
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label={ar ? "رمز التحقق" : "Verification code"}
        >
          <InputOTPGroup className="w-full justify-between" dir="ltr">
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="h-[60px] min-w-10 max-w-[50px] flex-1 rounded-xl border border-border-control bg-card text-[1.375rem] font-semibold"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {errorMessage && (
          <p className="text-center text-[0.75rem] text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
        {countdown === 0 && (
          <button
            type="button"
            className="min-h-11 font-bold text-primary"
            disabled={isResending}
            onClick={() => {
              setCountdown(60);
              onResend();
            }}
          >
            {isResending ? t(language, "common.resending") : t(language, "common.resend")}
          </button>
        )}
      </div>
      <div className="flex-1" />
      <div className="flex flex-col gap-3 px-6 pb-6">
        <button
          type="button"
          onClick={token.length === 6 && !isVerifying ? () => onVerify(token) : undefined}
          disabled={token.length !== 6 || isVerifying}
          className="h-[52px] rounded-2xl bg-primary font-bold text-primary-foreground disabled:opacity-45"
        >
          {isVerifying ? t(language, "common.verifying") : t(language, "common.verify")}
        </button>
        <button type="button" onClick={onDifferent} className="min-h-11 font-semibold text-primary">
          {ar ? "استخدام بريد آخر" : "Use a different email"}
        </button>
      </div>
    </div>
  );
}

export function AuthCallbackScreen({
  language,
  errorMessage,
  onReady,
}: {
  language: AppLanguage;
  errorMessage: string;
  onReady: () => void;
}) {
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  useEffect(() => {
    onReadyRef.current();
  }, []);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <BrandLockup compact />
      <h1 className="text-xl font-bold text-foreground">{t(language, "auth.completingSignIn")}</h1>
      <p
        className={errorMessage ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
        role={errorMessage ? "alert" : "status"}
      >
        {errorMessage || t(language, "auth.restoringAccount")}
      </p>
    </div>
  );
}

export function ProfileCompletionScreen({
  language,
  errorMessage,
  isSaving,
  onSave,
}: {
  language: AppLanguage;
  errorMessage: string;
  isSaving: boolean;
  onSave: (displayName: string) => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const ar = language === "ar";
  return (
    <div className="flex h-full flex-col bg-background px-6 pb-6 pt-12" dir={ar ? "rtl" : "ltr"}>
      <BrandLockup compact />
      <h1 className="mt-8 text-2xl font-extrabold text-foreground">
        {ar ? "كيف تحب أن نناديك؟" : "What should we call you?"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {ar
          ? "لم يرسل مزود الحساب اسماً. يمكنك تغييره لاحقاً."
          : "Your provider did not share a name. You can change it later."}
      </p>
      <input
        className="mt-8 h-12 rounded-xl border border-border-control bg-card px-4 text-foreground"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        autoComplete="name"
        aria-label={ar ? "الاسم المعروض" : "Display name"}
        aria-describedby={errorMessage ? "profile-error" : undefined}
        aria-invalid={errorMessage ? "true" : undefined}
      />
      {errorMessage && (
        <p id="profile-error" className="mt-2 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="flex-1" />
      <button
        type="button"
        disabled={!displayName.trim() || isSaving}
        aria-busy={isSaving || undefined}
        onClick={() => onSave(displayName)}
        className="h-12 rounded-xl bg-primary font-bold text-primary-foreground disabled:opacity-50"
      >
        {isSaving ? (ar ? "جارٍ الحفظ…" : "Saving…") : ar ? "متابعة" : "Continue"}
      </button>
    </div>
  );
}
