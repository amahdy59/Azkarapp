import React, { useEffect, useState } from "react";
import { ArrowPrevious, ChevronDown, Clock, Globe } from "../../components/icons";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../components/ui/input-otp";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { BrandLockup } from "../onboarding/OnboardingBrand";

const rtlFont = { fontFamily: "'IBM Plex Sans Arabic', sans-serif" };
const termsUrl = (import.meta.env.VITE_TERMS_URL as string | undefined)?.trim() || "";
const privacyUrl = (import.meta.env.VITE_PRIVACY_URL as string | undefined)?.trim() || "";

function LegalConsent({ language, compact = false }: { language: AppLanguage; compact?: boolean }) {
  const ar = language === "ar";
  if (!termsUrl || !privacyUrl) {
    return (
      <p className={`text-center text-muted-foreground ${compact ? "text-[10px]" : "text-[11px] leading-4"}`}>
        {ar
          ? "سيُتاح تسجيل الدخول بعد نشر شروط الخدمة وسياسة الخصوصية."
          : "Account sign-in will open after the Terms and Privacy Policy are published."}
      </p>
    );
  }

  return (
    <p className={`text-center text-muted-foreground ${compact ? "text-[10px]" : "text-[11px] leading-4"}`}>
      {ar ? "بالمتابعة، أنت توافق على " : "By continuing you agree to our "}
      <a
        className="font-semibold text-primary underline underline-offset-2"
        href={termsUrl}
        target="_blank"
        rel="noreferrer"
      >
        {ar ? "شروط الخدمة" : "Terms"}
      </a>
      {ar ? " و" : " & "}
      <a
        className="font-semibold text-primary underline underline-offset-2"
        href={privacyUrl}
        target="_blank"
        rel="noreferrer"
      >
        {ar ? "سياسة الخصوصية" : "Privacy Policy"}
      </a>
    </p>
  );
}

export function LoginScreen({
  language,
  phoneAuthEnabled,
  onPhone,
  onGuest,
}: {
  language: AppLanguage;
  phoneAuthEnabled: boolean;
  onPhone: () => void;
  onGuest: () => void;
}) {
  const ar = language === "ar";
  const accountAuthEnabled = phoneAuthEnabled && Boolean(termsUrl) && Boolean(privacyUrl);
  return (
    <div
      className="flex h-full flex-col bg-background px-6 pb-7 pt-8 slide-in-from-right"
      dir={ar ? "rtl" : "ltr"}
      style={ar ? rtlFont : undefined}
    >
      <div className="flex flex-col items-center gap-7">
        <BrandLockup compact />
        <div className="text-center">
          <h1 className="text-[28px] font-extrabold leading-9 tracking-[-0.28px] text-foreground">
            {t(language, "auth.welcome")}
          </h1>
          <p className="mt-2 text-[14px] leading-[22px] text-muted-foreground">{t(language, "auth.syncSubtitle")}</p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center gap-4">
            <span className="h-px flex-1 bg-card" />
            <span className="text-[12px] font-semibold uppercase text-muted-foreground/60">
              {t(language, "auth.or")}
            </span>
            <span className="h-px flex-1 bg-card" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={accountAuthEnabled ? onPhone : undefined}
              disabled={!accountAuthEnabled}
              className="min-h-11 text-[15px] font-semibold text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
            >
              {ar ? "المتابعة باستخدام رقم الهاتف" : "Continue with Phone Number"}
            </button>
            {!accountAuthEnabled && (
              <p className="text-center text-[11px] leading-4 text-muted-foreground">
                {ar
                  ? "تسجيل الدخول غير متاح حاليًا؛ يمكنك المتابعة كزائر."
                  : "Sign-in is not available yet. You can continue as a guest."}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-4">
        <button
          data-testid="continue-as-guest"
          onClick={onGuest}
          className="h-12 w-full rounded-xl bg-secondary text-[15px] font-semibold text-secondary-foreground transition-transform active:scale-[0.98]"
        >
          {t(language, "auth.continueAsGuest")}
        </button>
        <LegalConsent language={language} />
      </div>
    </div>
  );
}

export function PhoneInputScreen({
  language,
  initialPhone,
  errorMessage,
  isSending,
  onSend,
  onBack,
  onSkip,
}: {
  language: AppLanguage;
  initialPhone: string;
  errorMessage: string;
  isSending: boolean;
  onSend: (phone: string) => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const [phone, setPhone] = useState(initialPhone);
  const canSend = phone.replace(/\s/g, "").length >= 7;
  const ar = language === "ar";
  return (
    <div
      className="flex h-full flex-col bg-background slide-in-from-right"
      dir={ar ? "rtl" : "ltr"}
      style={ar ? rtlFont : undefined}
    >
      <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-5">
        <button
          onClick={onBack}
          className="flex size-11 items-center justify-center justify-self-start"
          aria-label="Back"
        >
          <ArrowPrevious size={24} className={ar ? "rotate-180 text-foreground" : "text-foreground"} />
        </button>
        <p className="text-[17px] font-semibold text-foreground">{t(language, "auth.signIn")}</p>
        <button
          onClick={onSkip}
          className="min-h-11 justify-self-end px-2 text-[15px] font-medium text-muted-foreground"
        >
          {t(language, "auth.skip")}
        </button>
      </header>
      <div className="flex flex-col gap-8 px-6 pt-6">
        <div>
          <h1 className="text-[24px] font-extrabold leading-8 text-foreground">{t(language, "auth.enterNumber")}</h1>
          <p className="mt-2 text-[14px] leading-5 text-muted-foreground">{t(language, "auth.phoneHelp")}</p>
        </div>
        <div className="flex h-[60px] items-center gap-3 rounded-2xl border-[1.5px] border-primary bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg border border-secondary px-2 py-1.5 text-[15px] text-foreground"
            aria-label="Country code Saudi Arabia plus 966"
          >
            <span>🇸🇦 +966</span>
            <ChevronDown size={11} />
          </button>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="50 123 4567"
            className="min-w-0 flex-1 bg-transparent text-[18px] font-semibold text-foreground outline-none"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
          />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Globe size={15} />
          <p className="text-[12px]">{t(language, "auth.countriesSupported")}</p>
        </div>
        {errorMessage && (
          <p className="text-[12px] text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-4 px-6 pb-6">
        <button
          onClick={canSend && !isSending ? () => onSend(phone.trim()) : undefined}
          disabled={!canSend || isSending}
          className="h-[52px] w-full rounded-2xl border-2 border-primary/20 bg-primary text-[16px] font-bold text-primary-foreground disabled:opacity-45"
        >
          {isSending ? t(language, "common.sending") : t(language, "auth.sendVerificationCode")}
        </button>
        <LegalConsent language={language} compact />
        <span className="h-[5px] w-[134px] rounded-full bg-foreground" />
      </div>
    </div>
  );
}

export function OTPScreen({
  language,
  maskedPhone,
  errorMessage,
  isVerifying,
  isResending,
  onVerify,
  onResend,
  onBack,
  onDifferent,
}: {
  language: AppLanguage;
  maskedPhone: string;
  errorMessage: string;
  isVerifying: boolean;
  isResending: boolean;
  onVerify: (token: string) => void;
  onResend: () => void;
  onBack: () => void;
  onDifferent: () => void;
}) {
  const [token, setToken] = useState("");
  const [countdown, setCountdown] = useState(272);
  useEffect(() => {
    const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const ar = language === "ar";
  const minutes = Math.floor(countdown / 60);
  const seconds = String(countdown % 60).padStart(2, "0");
  const complete = token.length === 6;
  return (
    <div
      className="flex h-full flex-col bg-background slide-in-from-right"
      dir={ar ? "rtl" : "ltr"}
      style={ar ? rtlFont : undefined}
    >
      <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-5">
        <button
          onClick={onBack}
          className="flex size-11 items-center justify-center justify-self-start"
          aria-label="Back"
        >
          <ArrowPrevious size={24} className={ar ? "rotate-180 text-foreground" : "text-foreground"} />
        </button>
        <p className="text-[17px] font-semibold text-foreground">{t(language, "auth.verifyNumber")}</p>
        <span />
      </header>
      <div className="flex flex-col gap-8 px-6 pt-5">
        <div className="flex flex-col gap-3">
          <p className="text-[14px] leading-[22px] text-muted-foreground">
            {t(language, "auth.codeSentTo")}{" "}
            <strong className="text-foreground" dir="ltr">
              {maskedPhone || "+966 ••• ••• 789"}
            </strong>
          </p>
          <div className="flex items-center gap-1.5 text-primary">
            <Clock size={15} />
            <p className="text-[14px] font-semibold">
              {t(language, "auth.codeExpiresIn")} {minutes}:{seconds}
            </p>
          </div>
        </div>
        <InputOTP
          maxLength={6}
          value={token}
          onChange={(value) => setToken(value.replace(/\D/g, "").slice(0, 6))}
          containerClassName="justify-center"
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label="Verification code"
        >
          <InputOTPGroup className="w-full justify-between" dir="ltr">
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="h-[60px] w-[50px] rounded-xl border border-card bg-card text-[22px] font-semibold text-foreground first:rounded-xl first:border-l last:rounded-xl data-[active=true]:border-2 data-[active=true]:border-primary data-[active=true]:ring-0"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {errorMessage && (
          <p className="text-center text-[12px] text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
        <p className="text-center text-[14px] text-muted-foreground">
          {t(language, "auth.didntReceive")}{" "}
          {countdown === 0 ? (
            <button
              className="min-h-11 px-2 font-bold text-primary"
              disabled={isResending}
              onClick={() => {
                setCountdown(60);
                onResend();
              }}
            >
              {isResending ? t(language, "common.resending") : t(language, "common.resend")}
            </button>
          ) : (
            <strong className="text-primary">{t(language, "auth.resendIn", { seconds: countdown })}</strong>
          )}
        </p>
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-3 px-6 pb-6">
        <button
          onClick={complete && !isVerifying ? () => onVerify(token) : undefined}
          disabled={!complete || isVerifying}
          className="h-[52px] w-full rounded-2xl border-2 border-primary/20 bg-primary text-[16px] font-bold text-primary-foreground disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
        >
          {isVerifying ? t(language, "common.verifying") : t(language, "common.verify")}
        </button>
        <button onClick={onDifferent} className="min-h-11 px-3 text-[15px] font-semibold text-primary">
          {t(language, "auth.tryDifferentNumber")}
        </button>
        <span className="h-[5px] w-[134px] rounded-full bg-foreground" />
      </div>
    </div>
  );
}
