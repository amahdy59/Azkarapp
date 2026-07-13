import React from "react";

export function ArStatusBar() {
  return (
    <div className="flex items-center justify-between px-6 shrink-0 h-[44px] pt-[10px]">
      <span className="text-[14px] font-semibold text-foreground font-sans">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 4.5}
              y={12 - (3 + i * 3)}
              width="3"
              height={3 + i * 3}
              rx="0.5"
              fill="currentColor"
              className="text-foreground"
              opacity={i < 3 ? 1 : 1}
            />
          ))}
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path
            d="M8 9.5L8 10.5"
            stroke="currentColor"
            className="text-foreground"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M5.5 7C6.3 6.2 7.1 5.8 8 5.8s1.7.4 2.5 1.2"
            stroke="currentColor"
            className="text-foreground"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M3 4.5C4.6 2.9 6.2 2 8 2s3.4.9 5 2.5"
            stroke="currentColor"
            className="text-foreground"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div className="relative w-[24px] h-[12px]">
          <div className="absolute inset-0 rounded-sm border-[1.5px] border-foreground opacity-60" />
          <div className="absolute rounded-sm top-[2px] left-[2px] right-[4px] bottom-[2px] bg-foreground" />
          <div className="absolute -right-[3px] top-[3.5px] w-[2px] h-[5px] bg-foreground opacity-50 rounded-[1px]" />
        </div>
      </div>
    </div>
  );
}

export function ArFeatureRow({ text, colorClass }: { text: string; colorClass: string }) {
  return (
    <div className="flex items-center gap-3 w-full justify-end" dir="rtl">
      <p
        className="text-[14px] text-foreground leading-[22px] whitespace-nowrap"
        style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
        dir="auto"
      >
        {text}
      </p>
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorClass}`} />
    </div>
  );
}

export function ArStepDots({ active, total = 3 }: { active: number; total?: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${i === active ? "bg-primary" : "bg-muted-foreground"}`}
          style={{
            width: i === active ? 24 : 8,
            height: 8,
            opacity: i === active ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

export function HomeIndicatorBar() {
  return (
    <div className="flex items-center justify-center shrink-0 h-[34px]">
      <div className="rounded-full w-[134px] h-[5px] bg-foreground opacity-30" />
    </div>
  );
}

export function ArOnboarding1Screen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <ArStatusBar />

      <div className="relative shrink-0 flex items-center justify-center overflow-hidden h-[340px]">
        <div
          className="absolute w-[240px] h-[240px] rounded-full blur-[30px]"
          style={{
            background: `radial-gradient(circle, color-mix(in srgb, var(--primary) 26%, transparent) 0%, transparent 70%)`,
          }}
        />

        <svg width="180" height="180" viewBox="0 0 180 180" fill="none" className="relative">
          <circle cx="90" cy="90" r="70" fill="currentColor" className="text-primary" />
          <circle cx="105" cy="65" r="65" fill="currentColor" className="text-background" />
        </svg>

        <div className="absolute left-[80px] top-[100px]">
          <svg width="4" height="4" viewBox="0 0 4 4">
            <circle cx="2" cy="2" r="2" fill="currentColor" className="text-primary" />
          </svg>
        </div>
        <div className="absolute left-[300px] top-[150px]">
          <svg width="3" height="3" viewBox="0 0 3 3">
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" className="text-primary" />
          </svg>
        </div>
        <div className="absolute left-[240px] top-[60px]">
          <svg width="5" height="5" viewBox="0 0 5 5">
            <circle cx="2.5" cy="2.5" r="2.5" fill="currentColor" className="text-primary" />
          </svg>
        </div>

        <div className="absolute flex flex-col items-center gap-1 whitespace-nowrap bottom-[24px] left-1/2 -translate-x-1/2">
          <p
            className="text-[44px] font-extrabold text-foreground leading-normal tracking-[-0.88px]"
            style={{ fontFamily: "'Noto Sans Arabic', 'Inter', sans-serif" }}
            dir="auto"
          >
            أذكار
          </p>
          <p className="text-[9px] font-bold text-primary font-sans tracking-[0.72px] leading-[13px]" dir="auto">
            أذكـار
          </p>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-7 justify-between pb-5">
        <div className="flex flex-col gap-8">
          <ArStepDots active={0} />

          <div className="flex flex-col gap-3 items-center text-center" dir="rtl">
            <p
              className="text-[28px] font-bold text-foreground whitespace-nowrap leading-[40px]"
              style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
              dir="auto"
            >
              ذكرك الإسلامي اليومي
            </p>
            <div
              dir="auto"
              className="text-[14px] text-muted-foreground leading-[22px] text-center"
              style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
            >
              <p>أذكار الصباح · المساء · قبل النوم</p>
              <p>أذكار موثقة من حصن المسلم</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <ArFeatureRow text="أدعية موثقة من حصن المسلم" colorClass="bg-primary" />
            <ArFeatureRow text="١٥ صباح، ١٥ مساء، ١٠ أذكار النوم" colorClass="bg-[#24A08A]" />
            <ArFeatureRow text="يعمل بدون إنترنت — متاح دائماً" colorClass="bg-primary" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onNext}
            className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95 h-[52px] bg-primary text-[17px] font-semibold text-primary-foreground"
            style={{ fontFamily: "'Noto Sans Arabic', 'Inter', sans-serif" }}
            dir="auto"
          >
            ابدأ الآن
          </button>
          <button onClick={onSkip}>
            <p
              className="text-[14px] font-semibold text-muted-foreground text-center w-full leading-[22px]"
              style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
              dir="auto"
            >
              تخطي
            </p>
          </button>
        </div>
      </div>

      <HomeIndicatorBar />
    </div>
  );
}

export function ArOnboarding2Screen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const count = 7,
    total = 33;
  const r = 52,
    circ = 2 * Math.PI * r;
  const pct = count / total;

  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <ArStatusBar />

      <div className="relative shrink-0 overflow-hidden h-[340px] bg-background">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px]">
          <svg width="240" height="240" viewBox="0 0 240 240" fill="none">
            <circle cx="120" cy="120" r="119.5" stroke="currentColor" className="text-primary" opacity="0.1" />
          </svg>
        </div>

        {[
          { d: 190, op: 0.2 },
          { d: 150, op: 0.3 },
        ].map(({ d, op }, i) => (
          <div key={i} className="absolute left-0 top-0" style={{ width: d, height: d }}>
            <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`} fill="none">
              <circle
                cx={d / 2}
                cy={d / 2}
                r={d / 2 - 0.5}
                stroke="currentColor"
                className="text-primary"
                opacity={op}
              />
            </svg>
          </div>
        ))}

        <div className="absolute left-0 top-0 w-[120px] h-[120px]">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="-rotate-90">
            <circle cx="60" cy="60" r={r} stroke="currentColor" className="text-muted" strokeWidth="8" fill="none" />
            <circle
              cx="60"
              cy="60"
              r={r}
              stroke="currentColor"
              className="text-primary"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
            />
          </svg>
        </div>

        <div className="absolute flex flex-col items-center gap-0.5 whitespace-nowrap left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <p
            className="text-[9px] font-bold text-primary opacity-80 leading-[13px] tracking-[0.72px]"
            style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
            dir="auto"
          >
            انقر للعد
          </p>
          <p
            className="text-[56px] font-extrabold text-foreground leading-normal"
            style={{ fontFamily: "'Noto Sans Arabic', 'Inter', sans-serif" }}
          >
            ٧
          </p>
          <p
            className="text-[14px] font-semibold text-primary leading-[22px]"
            style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
            dir="auto"
          >
            من ٣٣
          </p>
        </div>

        <p
          className="absolute right-[48px] top-1/2 text-[20px] font-bold text-[#24A08A] leading-normal"
          style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
          dir="auto"
        >
          +١
        </p>
      </div>

      <div className="flex flex-col flex-1 px-7 justify-between pb-5">
        <div className="flex flex-col gap-8">
          <ArStepDots active={1} />

          <div className="flex flex-col gap-3 items-center text-center">
            <p
              className="text-[28px] font-bold text-foreground leading-[40px] whitespace-nowrap"
              style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
              dir="auto"
            >
              عدّ كل ذكر
            </p>
            <p
              className="text-[14px] text-muted-foreground leading-[22px] text-center"
              style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
              dir="auto"
            >
              انقر في أي مكان على الشاشة — كامل الشاشة هو عدادك. اهتزاز خفيف مع كل نقرة.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <ArFeatureRow text="يتقدم تلقائياً عند اكتمال العدد" colorClass="bg-primary" />
            <ArFeatureRow text="حفظ التقدم — لن تضيع مكانك" colorClass="bg-primary" />
            <ArFeatureRow text="اسحب للتنقل بين الأذكار" colorClass="bg-primary" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onNext}
            className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95 h-[52px] bg-primary text-[17px] font-semibold text-primary-foreground"
            style={{ fontFamily: "'Noto Sans Arabic', 'Inter', sans-serif" }}
            dir="auto"
          >
            التالي
          </button>
          <button onClick={onBack}>
            <p
              className="text-[14px] font-semibold text-muted-foreground leading-[22px] text-center w-full"
              style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
              dir="auto"
            >
              رجوع
            </p>
          </button>
        </div>
      </div>

      <HomeIndicatorBar />
    </div>
  );
}

export function ArOnboarding3Screen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <ArStatusBar />

      <div className="relative shrink-0 flex items-center justify-center overflow-hidden h-[340px] bg-background">
        <div className="absolute left-[20px] top-[80px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line
              x1="12"
              y1="2"
              x2="12"
              y2="22"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="2"
              y1="12"
              x2="22"
              y2="12"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="4.9"
              y1="4.9"
              x2="19.1"
              y2="19.1"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="19.1"
              y1="4.9"
              x2="4.9"
              y2="19.1"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="relative flex items-end gap-1 w-[178px] h-[117px]">
          <div className="flex items-center justify-center rounded-sm shrink-0 w-[80px] h-[110px] bg-card border border-border origin-bottom -rotate-5" />
          <div className="flex items-center justify-center rounded-sm px-2 shrink-0 w-[80px] h-[110px] bg-card border border-border origin-bottom rotate-5">
            <p
              className="zikr-text w-[60px] text-center text-[14px] font-bold leading-[22px] text-foreground"
              dir="rtl"
            >
              اللَّهُمَّ إِنِّي أَسْأَلُكَ
            </p>
          </div>
        </div>

        <div className="absolute flex items-center px-3 py-1 rounded-full left-[20px] top-[258px] bg-[#24A08A] bg-opacity-20 border border-[#24A08A]">
          <p
            className="text-[10px] font-medium text-[#24A08A] leading-[14px] whitespace-nowrap"
            style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
            dir="auto"
          >
            حصن المسلم · موثق
          </p>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-7 justify-between pb-5">
        <div className="flex flex-col gap-8">
          <ArStepDots active={2} />

          <div className="flex flex-col gap-3 items-center text-center">
            <p
              className="text-[28px] font-bold text-foreground leading-[40px] whitespace-nowrap"
              style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
              dir="auto"
            >
              اعرف فضل كل ذكر
            </p>
            <p
              className="text-[14px] text-muted-foreground leading-[22px] text-center"
              style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
              dir="auto"
            >
              فضل كل ذكر مذكور من الحديث النبوي الشريف. افهم لماذا تقرأ هذا الذكر.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <ArFeatureRow text="مصدر الحديث لكل ذكر" colorClass="bg-primary" />
            <ArFeatureRow text="الفضل والثواب الروحي موضح" colorClass="bg-primary" />
            <ArFeatureRow text="وضع فاتح وداكن · دعم اللغة العربية" colorClass="bg-primary" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onNext}
            className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95 h-[52px] bg-primary text-[17px] font-semibold text-primary-foreground"
            style={{ fontFamily: "'Noto Sans Arabic', 'Inter', sans-serif" }}
            dir="auto"
          >
            ابدأ رحلتك
          </button>
          <p
            className="text-[14px] text-muted-foreground leading-[22px] text-center"
            style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
            dir="auto"
          >
            لديك حساب بالفعل؟ <span className="text-primary font-semibold">تسجيل الدخول</span>
          </p>
        </div>
      </div>

      <HomeIndicatorBar />
    </div>
  );
}
