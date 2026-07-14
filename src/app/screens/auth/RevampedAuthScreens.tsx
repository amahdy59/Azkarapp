import React, { useEffect, useState } from "react";
import { ArrowPrevious, ChevronDown, Clock, Globe } from "../../components/icons";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../components/ui/input-otp";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { BrandLockup } from "../onboarding/OnboardingBrand";

const rtlFont = { fontFamily: "'IBM Plex Sans Arabic', sans-serif" };

function GoogleIcon() {
  return <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.6 0 6.4 1.4 8.4 3.2l6.3-6.3C34.8 2.8 29.8 0 24 0 14.6 0 6.6 5.5 2.8 13.5l7.3 5.7C11.9 13 17.5 9.5 24 9.5z"/><path fill="#4285F4" d="M46.6 24.5c0-1.6-.2-3.2-.5-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.9 7.2l7.5 5.8c4.4-4 7.3-10 7.3-17z"/><path fill="#FBBC05" d="M10.1 28.8c-.4-1.2-.6-2.5-.6-3.8 0-1.7.3-3.3.7-4.8L2.8 13.5A24 24 0 0 0 0 24c0 3.8.9 7.5 2.8 10.5l7.3-5.7z"/><path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.4l-7.5-5.8c-2 1.4-4.6 2.2-7.2 2.2-6.5 0-12-4.4-14-10.2l-7.3 5.7C6.6 42.5 14.6 48 24 48z"/></svg>;
}

function AppleIcon() {
  return <svg width="18" height="22" viewBox="0 0 16 20" fill="currentColor" aria-hidden="true"><path d="M13.2 10.6c0-2.7 2.3-4.1 2.4-4.2-1.3-1.9-3.3-2.1-4-2.2-1.7-.2-3.4 1-4.2 1-.8 0-2.2-1-3.6-.9-1.8 0-3.5 1.1-4.4 2.7C-1.6 10.2-.2 15.2 1.6 18c.9 1.3 1.9 2.7 3.3 2.7s1.8-.8 3.4-.8c1.6 0 2 .8 3.5.8 1.4 0 2.3-1.3 3.2-2.6.6-.9 1.1-1.8 1.4-2.1-.1-.1-2.2-.9-2.2-3.4zM10.5 2.9c.7-.9 1.3-2.2 1.1-3.4-1.1.1-2.4.7-3.1 1.6-.7.8-1.3 2.1-1.1 3.3 1.2.1 2.4-.6 3.1-1.5z"/></svg>;
}

export function LoginScreen({ language, phoneAuthEnabled, onPhone, onGuest }: { language: AppLanguage; phoneAuthEnabled: boolean; onPhone: () => void; onGuest: () => void }) {
  const ar = language === "ar";
  return (
    <div className="flex h-full flex-col bg-background px-6 pb-7 pt-8 slide-in-from-right" dir={ar ? "rtl" : "ltr"} style={ar ? rtlFont : undefined}>
      <div className="flex flex-col items-center gap-7">
        <BrandLockup compact />
        <div className="text-center">
          <h1 className="text-[28px] font-extrabold leading-9 tracking-[-0.28px] text-foreground">{t(language, "auth.welcome")}</h1>
          <p className="mt-2 text-[14px] leading-[22px] text-muted-foreground">{t(language, "auth.syncSubtitle")}</p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <button disabled className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#e5e7eb] bg-white text-[15px] font-semibold text-[#111] shadow-sm"><GoogleIcon />{ar ? "المتابعة باستخدام Google" : "Continue with Google"}</button>
          <button disabled className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#e5e7eb] bg-white text-[15px] font-semibold text-[#111] shadow-sm"><AppleIcon />{ar ? "المتابعة باستخدام Apple" : "Continue with Apple"}</button>
        </div>
        <div className="flex w-full items-center gap-4"><span className="h-px flex-1 bg-card"/><span className="text-[12px] font-semibold uppercase text-muted-foreground/60">{t(language, "auth.or")}</span><span className="h-px flex-1 bg-card"/></div>
        <button onClick={phoneAuthEnabled ? onPhone : undefined} disabled={!phoneAuthEnabled} className="min-h-11 text-[15px] font-semibold text-primary disabled:opacity-55">{ar ? "المتابعة باستخدام رقم الهاتف" : "Continue with Phone Number"}</button>
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-4">
        <button onClick={onGuest} className="h-12 w-full rounded-xl border border-border bg-transparent text-[15px] font-semibold text-primary transition-transform active:scale-[0.98]">{t(language, "auth.continueAsGuest")}</button>
        <p className="text-center text-[11px] leading-4 text-muted-foreground">{ar ? "بالمتابعة، أنت توافق على الشروط والأحكام وسياسة الخصوصية" : "By continuing you agree to our Terms & Privacy Policy"}</p>
      </div>
    </div>
  );
}

export function PhoneInputScreen({ language, initialPhone, errorMessage, isSending, onSend, onBack, onSkip }: { language: AppLanguage; initialPhone: string; errorMessage: string; isSending: boolean; onSend: (phone: string) => void; onBack: () => void; onSkip: () => void }) {
  const [phone, setPhone] = useState(initialPhone);
  const canSend = phone.replace(/\s/g, "").length >= 7;
  const ar = language === "ar";
  return (
    <div className="flex h-full flex-col bg-background slide-in-from-right" dir={ar ? "rtl" : "ltr"} style={ar ? rtlFont : undefined}>
      <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-5">
        <button onClick={onBack} className="flex size-11 items-center justify-center justify-self-start" aria-label="Back"><ArrowPrevious size={24} className={ar ? "rotate-180 text-foreground" : "text-foreground"}/></button>
        <p className="text-[17px] font-semibold text-foreground">{t(language, "auth.signIn")}</p>
        <button onClick={onSkip} className="min-h-11 justify-self-end px-2 text-[15px] font-medium text-muted-foreground">{t(language, "auth.skip")}</button>
      </header>
      <div className="flex flex-col gap-8 px-6 pt-6">
        <div><h1 className="text-[24px] font-extrabold leading-8 text-foreground">{t(language, "auth.enterNumber")}</h1><p className="mt-2 text-[14px] leading-5 text-muted-foreground">{t(language, "auth.phoneHelp")}</p></div>
        <div className="flex h-[60px] items-center gap-3 rounded-2xl border-[1.5px] border-primary bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
          <button type="button" className="flex items-center gap-1 rounded-lg border border-secondary px-2 py-1.5 text-[15px] text-foreground" aria-label="Country code Saudi Arabia plus 966"><span>🇸🇦 +966</span><ChevronDown size={11}/></button>
          <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="50 123 4567" className="min-w-0 flex-1 bg-transparent text-[18px] font-semibold text-foreground outline-none" inputMode="tel" autoComplete="tel" dir="ltr" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground"><Globe size={15}/><p className="text-[12px]">{t(language, "auth.countriesSupported")}</p></div>
        {errorMessage && <p className="text-[12px] text-destructive" role="alert">{errorMessage}</p>}
      </div>
      <div className="flex-1" />
      <div className="flex flex-col items-center gap-4 px-6 pb-6">
        <button onClick={canSend && !isSending ? () => onSend(phone.trim()) : undefined} disabled={!canSend || isSending} className="h-[52px] w-full rounded-2xl border-2 border-white/10 bg-primary text-[16px] font-bold text-primary-foreground disabled:opacity-45">{isSending ? t(language, "common.sending") : t(language, "auth.sendVerificationCode")}</button>
        <p className="text-center text-[10px] text-muted-foreground">{ar ? "بالمتابعة أنت توافق على شروط الخدمة وسياسة الخصوصية" : "By continuing you agree to our Terms of Service and Privacy Policy"}</p>
        <span className="h-[5px] w-[134px] rounded-full bg-foreground"/>
      </div>
    </div>
  );
}

export function OTPScreen({ language, maskedPhone, errorMessage, isVerifying, isResending, onVerify, onResend, onBack, onDifferent }: { language: AppLanguage; maskedPhone: string; errorMessage: string; isVerifying: boolean; isResending: boolean; onVerify: (token: string) => void; onResend: () => void; onBack: () => void; onDifferent: () => void }) {
  const [token, setToken] = useState("");
  const [countdown, setCountdown] = useState(272);
  useEffect(() => { const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, []);
  const ar = language === "ar";
  const minutes = Math.floor(countdown / 60);
  const seconds = String(countdown % 60).padStart(2, "0");
  const complete = token.length === 6;
  return (
    <div className="flex h-full flex-col bg-background slide-in-from-right" dir={ar ? "rtl" : "ltr"} style={ar ? rtlFont : undefined}>
      <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center px-5"><button onClick={onBack} className="flex size-11 items-center justify-center justify-self-start" aria-label="Back"><ArrowPrevious size={24} className={ar ? "rotate-180 text-foreground" : "text-foreground"}/></button><p className="text-[17px] font-semibold text-foreground">{t(language, "auth.verifyNumber")}</p><span/></header>
      <div className="flex flex-col gap-8 px-6 pt-5">
        <div className="flex flex-col gap-3"><p className="text-[14px] leading-[22px] text-muted-foreground">{t(language, "auth.codeSentTo")} <strong className="text-foreground" dir="ltr">{maskedPhone || "+966 ••• ••• 789"}</strong></p><div className="flex items-center gap-1.5 text-primary"><Clock size={15}/><p className="text-[14px] font-semibold">{t(language, "auth.codeExpiresIn")} {minutes}:{seconds}</p></div></div>
        <InputOTP maxLength={6} value={token} onChange={(value) => setToken(value.replace(/\D/g, "").slice(0, 6))} containerClassName="justify-center" inputMode="numeric" autoComplete="one-time-code" aria-label="Verification code">
          <InputOTPGroup className="w-full justify-between" dir="ltr">{Array.from({ length: 6 }).map((_, index) => <InputOTPSlot key={index} index={index} className="h-[60px] w-[50px] rounded-xl border border-card bg-card text-[22px] font-semibold text-foreground first:rounded-xl first:border-l last:rounded-xl data-[active=true]:border-2 data-[active=true]:border-primary data-[active=true]:ring-0"/>)}</InputOTPGroup>
        </InputOTP>
        {errorMessage && <p className="text-center text-[12px] text-destructive" role="alert">{errorMessage}</p>}
        <p className="text-center text-[14px] text-muted-foreground">{t(language, "auth.didntReceive")} {countdown === 0 ? <button className="min-h-11 px-2 font-bold text-primary" disabled={isResending} onClick={() => { setCountdown(60); onResend(); }}>{isResending ? t(language, "common.resending") : t(language, "common.resend")}</button> : <strong className="text-primary">{t(language, "auth.resendIn", { seconds: countdown })}</strong>}</p>
      </div>
      <div className="flex-1"/>
      <div className="flex flex-col items-center gap-3 px-6 pb-6">
        <button onClick={complete && !isVerifying ? () => onVerify(token) : undefined} disabled={!complete || isVerifying} className="h-[52px] w-full rounded-2xl border-2 border-white/10 bg-primary text-[16px] font-bold text-primary-foreground disabled:border-border disabled:bg-[#f5f5f5] disabled:text-[#a4a7ae]">{isVerifying ? t(language, "common.verifying") : t(language, "common.verify")}</button>
        <button onClick={onDifferent} className="min-h-11 px-3 text-[15px] font-semibold text-primary">{t(language, "auth.tryDifferentNumber")}</button>
        <span className="h-[5px] w-[134px] rounded-full bg-foreground"/>
      </div>
    </div>
  );
}
