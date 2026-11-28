import { PLAY_STORE_QR } from "../share/appShareLinks";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { Share2 } from "./icons";
import { Button } from "./ui/button";

export function HomeAppShareCard({
  language,
  onGlass,
  onOpen,
}: {
  language: AppLanguage;
  onGlass: boolean;
  onOpen: () => void;
}) {
  return (
    <div data-testid="home-app-sharing">
      <Button
        type="button"
        variant="outline"
        className={`home-app-share w-full ${onGlass ? "hero-glass home-glass-surface" : ""}`}
        aria-label={t(language, "appSharing.title")}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          onOpen();
        }}
      >
        <span className="home-app-share-copy min-w-0">
          <span className="flex items-center gap-2">
            <Share2 aria-hidden="true" />
            {t(language, "appSharing.title")}
          </span>
          <span className="hidden text-sm font-normal text-muted-foreground min-[900px]:block">
            {t(language, "appSharing.scanHint")}
          </span>
        </span>
        <img
          data-testid="home-app-qr"
          src={PLAY_STORE_QR}
          alt={t(language, "appSharing.playStoreQrAlt")}
          width={156}
          height={156}
          loading="lazy"
          className="hidden size-[156px] shrink-0 rounded-xl min-[900px]:block"
        />
      </Button>
    </div>
  );
}
