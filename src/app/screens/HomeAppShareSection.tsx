import { lazy, Suspense, useState } from "react";
import { HomeAppShareCard } from "../components/HomeAppShareCard";
import type { AppLanguage } from "../types";
import { t } from "../i18n";

const AppSharingSheet = lazy(() => import("../components/AppShareSheet"));

export function HomeAppShareSection({
  language,
  direction,
  onGlass,
}: {
  language: AppLanguage;
  direction: "rtl" | "ltr";
  onGlass: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <HomeAppShareCard language={language} onGlass={onGlass} onOpen={() => setOpen(true)} />
      {open && (
        <Suspense
          fallback={
            <p role="status" className="text-sm text-muted-foreground">
              {t(language, "common.loading")}
            </p>
          }
        >
          <AppSharingSheet language={language} direction={direction} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
