import React from "react";
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
  }

  private resetPreferences = () => {
    resetStoredSettings();
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isArabic = typeof document !== "undefined" && document.documentElement.lang === "ar";
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <section
          className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-xl"
          role="alert"
          dir={isArabic ? "rtl" : "ltr"}
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
          <button
            type="button"
            onClick={this.resetPreferences}
            className="mt-6 min-h-11 w-full rounded-xl bg-primary px-4 font-semibold text-primary-foreground"
          >
            {isArabic ? "استعادة الإعدادات" : "Restore preferences"}
          </button>
        </section>
      </main>
    );
  }
}
