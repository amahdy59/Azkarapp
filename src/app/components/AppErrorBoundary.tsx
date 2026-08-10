import React from "react";
import { reportError } from "../../lib/observability";
import { resetStoredSettings } from "../state";

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Keeps a damaged preference or unexpected render error from leaving users on a blank screen. */
export class AppErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Azkar recovered from a render error", error);
    reportError(error, "react-render");
  }

  private resetPreferences = () => {
    resetStoredSettings();
    window.location.reload();
  };

  private retry = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // These strings stay inline on purpose — do not move them into the i18n
    // bundle with the rest of the app's copy. This screen renders only after
    // the app has already crashed, so importing `t` would pull ar.ts and en.ts
    // into the crash-recovery path and a failure inside them would break the
    // very screen meant to recover from failures. Same reasoning as DEC-024,
    // which keeps this component off the shared Button primitive.
    // The language is read from the document rather than app state for the same
    // reason: app state is what may have failed to load.
    const isArabic = typeof document !== "undefined" && document.documentElement.lang === "ar";
    const direction = typeof document !== "undefined" && document.documentElement.dir === "rtl" ? "rtl" : "ltr";
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-background p-6 text-foreground">
        <section
          className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-xl"
          role="alert"
          dir={direction}
        >
          <p className="text-sm font-semibold text-primary">Azkar</p>
          <h1 className="mt-2 text-2xl font-bold">
            {isArabic ? "تعذر تحميل بعض التفضيلات" : "Some preferences could not load"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {isArabic
              ? "يمكنك استعادة الإعدادات الافتراضية مع الاحتفاظ بالتقدم والجلسات والأذكار المحفوظة."
              : "Restore default preferences while keeping your progress, sessions, and saved azkar."}
          </p>
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={this.retry}
              className="min-h-11 w-full rounded-xl bg-primary px-4 font-semibold text-primary-foreground"
            >
              {isArabic ? "إعادة المحاولة" : "Try again"}
            </button>
            <button
              type="button"
              onClick={this.resetPreferences}
              className="min-h-11 w-full rounded-xl border border-border px-4 font-semibold text-foreground"
            >
              {isArabic ? "استعادة الإعدادات الافتراضية" : "Restore default preferences"}
            </button>
          </div>
        </section>
      </main>
    );
  }
}
