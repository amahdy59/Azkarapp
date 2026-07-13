import React, { useEffect, useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../components/ui/input-otp";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";

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
  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <div className="flex flex-col flex-1 px-7 pt-6 pb-6 gap-7">
        <div className="flex flex-col items-center gap-4">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-primary">
            <path
              d="M35 21.3A14 14 0 1 1 18.7 5 10.8 10.8 0 0 0 35 21.3z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line x1="28" y1="6" x2="28" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="25" y1="9" x2="31" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-[28px] font-extrabold text-foreground font-sans leading-[36px] tracking-[-0.28px] text-center">
            {t(language, "auth.welcome")}
          </p>
          <p className="text-[13px] text-muted-foreground font-sans leading-[20px] text-center">
            {t(language, "auth.syncSubtitle")}
          </p>
          {!phoneAuthEnabled && (
            <p className="text-[12px] text-primary font-sans leading-[18px] text-center">
              {t(language, "auth.phoneDisabled")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            disabled
            className="w-full flex items-center justify-center gap-3 rounded-lg h-12 bg-white opacity-60 cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
              <path
                fill="#EA4335"
                d="M24 9.5c3.6 0 6.4 1.4 8.4 3.2l6.3-6.3C34.8 2.8 29.8 0 24 0 14.6 0 6.6 5.5 2.8 13.5l7.3 5.7C11.9 13 17.5 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.6 24.5c0-1.6-.2-3.2-.5-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.9 7.2l7.5 5.8c4.4-4 7.3-10 7.3-17z"
              />
              <path
                fill="#FBBC05"
                d="M10.1 28.8c-.4-1.2-.6-2.5-.6-3.8 0-1.7.3-3.3.7-4.8L2.8 13.5A24 24 0 0 0 0 24c0 3.8.9 7.5 2.8 10.5l7.3-5.7z"
              />
              <path
                fill="#34A853"
                d="M24 48c6 0 11-2 14.7-5.4l-7.5-5.8c-2 1.4-4.6 2.2-7.2 2.2-6.5 0-12-4.4-14-10.2l-7.3 5.7C6.6 42.5 14.6 48 24 48z"
              />
            </svg>
            <span className="text-[16px] font-semibold text-[#1A1228] font-sans">{t(language, "auth.googleSoon")}</span>
          </button>
          <button
            disabled
            className="w-full flex items-center justify-center gap-3 rounded-lg h-[52px] bg-[#1C1C2E] border-[1.5px] border-[#3A3A5C] opacity-60 cursor-not-allowed text-foreground"
          >
            <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor" className="shrink-0">
              <path d="M13.2 10.6c0-2.7 2.3-4.1 2.4-4.2-1.3-1.9-3.3-2.1-4-2.2-1.7-.2-3.4 1-4.2 1-.8 0-2.2-1-3.6-.9-1.8 0-3.5 1.1-4.4 2.7C-1.6 10.2-.2 15.2 1.6 18c.9 1.3 1.9 2.7 3.3 2.7s1.8-.8 3.4-.8c1.6 0 2 .8 3.5.8 1.4 0 2.3-1.3 3.2-2.6.6-.9 1.1-1.8 1.4-2.1-.1-.1-2.2-.9-2.2-3.4zM10.5 2.9c.7-.9 1.3-2.2 1.1-3.4-1.1.1-2.4.7-3.1 1.6-.7.8-1.3 2.1-1.1 3.3 1.2.1 2.4-.6 3.1-1.5z" />
            </svg>
            <span className="text-[16px] font-semibold font-sans text-foreground">{t(language, "auth.appleSoon")}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-card" />
          <p className="text-[11px] text-muted-foreground font-sans">{t(language, "auth.or")}</p>
          <div className="flex-1 h-px bg-card" />
        </div>

        <button
          onClick={phoneAuthEnabled ? onPhone : undefined}
          disabled={!phoneAuthEnabled}
          className={`w-full flex items-center gap-3 rounded-lg transition-all px-4 h-[56px] bg-card border border-border ${phoneAuthEnabled ? "opacity-100 cursor-pointer active:scale-95" : "opacity-50 cursor-not-allowed"}`}
        >
          <div className="flex items-center justify-center rounded-[18px] shrink-0 w-[36px] h-[36px] bg-secondary text-secondary-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M14.6 11.3c0 .3-.1.5-.2.8-.1.3-.3.5-.5.8-.3.4-.6.8-1 1-.4.2-.8.4-1.2.4-1.1 0-2.4-.3-3.7-.9C6.8 12.8 5.8 12 4.8 11 3.9 10 3.1 9 2.5 7.8 1.9 6.7 1.6 5.6 1.6 4.5c0-.4.1-.9.3-1.3.2-.4.6-.7 1.1-1C3.5 1.6 4.1 1.4 4.7 1.4c.2 0 .4 0 .7.1.2.1.5.2.7.4l2.2 3.2c.2.3.3.5.4.7.1.2.1.4.1.5 0 .2-.1.5-.2.7-.1.2-.3.4-.5.6l-.5.6c-.1.1-.1.2-.1.3s0 .2.1.3c.2.3.5.7.8 1 .4.4.7.8 1.1 1.1.1.1.2.1.3.1.1 0 .2-.1.3-.1l.5-.5c.2-.2.4-.4.6-.5.2-.1.4-.1.6-.1.2 0 .4 0 .5.1.2.1.4.2.7.4l3.2 2.3c.3.2.4.4.4.6z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex flex-col items-start flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-foreground font-sans leading-[20px]">
              {t(language, "auth.continueWithPhone")}
            </p>
            <p className="text-[11px] text-muted-foreground font-sans leading-[16px]">
              {t(language, "auth.otpSubtitle")}
            </p>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 text-primary">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <button
          onClick={onGuest}
          className="w-full flex flex-col items-center justify-center transition-all active:scale-95 px-4 py-[14px] bg-transparent border-[1.5px] border-dashed border-primary rounded-lg"
        >
          <p className="text-[17px] font-semibold text-primary font-sans leading-[24px]">
            {t(language, "auth.continueAsGuest")}
          </p>
          <p className="text-[10px] font-medium text-muted-foreground font-sans leading-[14px]">
            {t(language, "auth.guestWarning")}
          </p>
        </button>

        <div className="flex-1" />

        <p className="latin-ui text-center text-[11px] leading-[16px] text-muted-foreground" lang="en" dir="ltr">
          By continuing you agree to our <span className="text-primary underline underline-offset-2">Terms</span> &{" "}
          <span className="text-primary underline underline-offset-2">Privacy Policy</span>
        </p>
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

  return (
    <div className="flex flex-col h-full justify-between bg-background slide-in-from-right">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-5 shrink-0 h-[56px]">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-[44px] h-[44px] active:scale-95 transition-all"
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-foreground rtl:-scale-x-100">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <p className="text-[17px] font-semibold text-foreground font-sans">{t(language, "auth.signIn")}</p>
          <button onClick={onSkip} className="min-w-11 min-h-11 px-3 active:scale-95 transition-all">
            <p className="text-[17px] font-semibold text-muted-foreground font-sans">{t(language, "auth.skip")}</p>
          </button>
        </div>

        <div className="px-6 pt-6 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-[22px] font-bold text-foreground font-sans leading-[30px] tracking-[-0.11px]">
              {t(language, "auth.enterNumber")}
            </p>
            <p className="text-[13px] text-muted-foreground font-sans leading-[20px]">
              {t(language, "auth.phoneHelp")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor="phone-number" className="text-[14px] font-semibold text-foreground font-sans">
              {t(language, "auth.phoneNumberLabel")}
            </label>
            <div className="flex items-center rounded-xl gap-3 px-3 h-[60px] bg-card border-[1.5px] border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <button
                type="button"
                className="flex min-h-11 items-center gap-1.5 shrink-0 rounded-lg px-2 py-1 border border-secondary text-foreground"
                aria-label="Country code, Saudi Arabia plus 966"
                aria-haspopup="listbox"
              >
                <span className="text-[14px] font-sans">🇸🇦 +966</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-foreground">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <input
                id="phone-number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="50 123 4567"
                className="flex-1 bg-transparent focus:outline-none text-[17px] font-semibold text-foreground font-sans"
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="send"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted-foreground">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M7 3.5C5.3 4.2 4.5 5.5 4.5 7s.8 2.8 2.5 3.5M7 3.5C8.7 4.2 9.5 5.5 9.5 7s-.8 2.8-2.5 3.5M3.5 7h7M7 3.5v7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-[12px] text-muted-foreground font-sans">{t(language, "auth.countriesSupported")}</p>
          </div>

          {errorMessage && (
            <p className="text-[12px] text-destructive font-sans leading-[18px]" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 flex flex-col gap-3">
        <button
          onClick={canSend && !isSending ? () => onSend(phone.trim()) : undefined}
          disabled={!canSend || isSending}
          className={`w-full flex items-center justify-center rounded-xl transition-all h-[52px] bg-primary text-[17px] font-semibold text-primary-foreground font-sans ${canSend ? "opacity-100 active:scale-95" : "opacity-50 cursor-not-allowed"}`}
        >
          {isSending ? t(language, "common.sending") : t(language, "auth.sendVerificationCode")}
        </button>
        <p className="latin-ui text-center text-[10px] leading-[14px] text-muted-foreground" lang="en" dir="ltr">
          By continuing you agree to our{" "}
          <span className="text-primary underline underline-offset-2">Terms of Service</span>
          {" and "}
          <span className="text-primary underline underline-offset-2">Privacy Policy</span>
        </p>
        <div className="flex justify-center pt-1">
          <div className="rounded-full w-[134px] h-[5px] bg-foreground opacity-30" />
        </div>
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
    const timer = setInterval(() => setCountdown((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = String(Math.floor(countdown / 60));
  const secs = String(countdown % 60).padStart(2, "0");
  const isComplete = token.length === 6;

  return (
    <div className="flex flex-col h-full justify-between bg-background slide-in-from-right">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-5 shrink-0 h-[56px]">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-[44px] h-[44px] active:scale-95 transition-all"
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-foreground rtl:-scale-x-100">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <p className="text-[17px] font-semibold text-foreground font-sans">{t(language, "auth.verifyNumber")}</p>
          <div className="w-[44px]" />
        </div>

        <div className="px-6 pt-4 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-muted-foreground font-sans leading-[20px]">
              {t(language, "auth.codeSentTo")}{" "}
              <span className="text-foreground" dir="ltr">
                {maskedPhone}
              </span>
            </p>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" />
                <path d="M7 4V7.5L9 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <p className="text-[13px] text-primary font-sans leading-[20px]">
                {t(language, "auth.codeExpiresIn")} {mins}:{secs}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3" dir="ltr">
            <InputOTP
              maxLength={6}
              value={token}
              onChange={(value) => setToken(value.replace(/\D/g, "").slice(0, 6))}
              containerClassName="justify-center"
              className="w-full"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="Verification code"
            >
              <InputOTPGroup className="w-full justify-between">
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="h-[60px] w-[52px] rounded-lg border-2 border-transparent bg-card text-[24px] font-semibold text-foreground first:rounded-lg first:border-l-2 last:rounded-lg data-[active=true]:border-primary data-[active=true]:ring-0"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p
              className={`text-[13px] font-sans leading-[20px] text-center ${errorMessage ? "text-destructive" : "text-muted-foreground"}`}
              role={errorMessage ? "alert" : undefined}
            >
              {errorMessage || (!isComplete ? t(language, "auth.enterAllDigits") : "")}
            </p>
          </div>

          <p className="text-[13px] text-muted-foreground font-sans leading-[20px] text-center">
            {t(language, "auth.didntReceive")}{" "}
            {countdown === 0 ? (
              <button
                type="button"
                className={`text-primary font-semibold min-h-11 px-2 ${isResending ? "cursor-wait" : "cursor-pointer"}`}
                onClick={() => {
                  if (!isResending) {
                    setCountdown(60);
                    onResend();
                  }
                }}
              >
                {isResending ? t(language, "common.resending") : t(language, "common.resend")}
              </button>
            ) : (
              <span>{t(language, "auth.resendIn", { seconds: countdown })}</span>
            )}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 flex flex-col gap-3">
        <button
          onClick={isComplete && !isVerifying ? () => onVerify(token) : undefined}
          disabled={!isComplete || isVerifying}
          className={`w-full flex items-center justify-center rounded-xl transition-all h-[52px] bg-primary text-[17px] font-semibold text-primary-foreground font-sans ${isComplete ? "opacity-100 active:scale-95" : "opacity-40 cursor-not-allowed"}`}
        >
          {isVerifying ? t(language, "common.verifying") : t(language, "common.verify")}
        </button>
        <button
          onClick={onDifferent}
          className="w-full flex items-center justify-center rounded-xl h-[52px] bg-transparent text-[17px] font-semibold text-primary font-sans active:scale-95 transition-all"
        >
          {t(language, "auth.tryDifferentNumber")}
        </button>
        <div className="flex justify-center pt-1">
          <div className="rounded-full w-[134px] h-[5px] bg-foreground opacity-30" />
        </div>
      </div>
    </div>
  );
}
