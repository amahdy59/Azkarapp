/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- The named reading scroll region must be keyboard reachable. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowPrevious,
  Bookmark,
  BookmarkCheck,
  ChevronNext,
  ChevronPrevious,
  Download,
  List,
  SlidersHorizontal,
} from "../components/icons";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/ui/button";
import { Modal, SheetHeader } from "../components/ResponsiveSheet";
import { LearningContent } from "../components/LearningContent";
import { LearningContents } from "../components/LearningContents";
import { LearningOfflineActions } from "../components/LearningOfflineActions";
import { LearningLanguageChoices } from "../components/LearningLanguageChoices";
import { learningEditionNotice, learningEditions, resolveLearningResource } from "../learning/catalogue";
import { learningEditionId, type LearningLanguage } from "../learning/types";
import { fetchLearningAsset, loadLearningPack } from "../learning/learningAssets";
import { cancelLearningDownload, startLearningDownload } from "../learning/learningDownloads";
import { readLearningState, updateLearningState } from "../learning/learningState";
import { useLearningOffline, useLearningPdf, useLearningPosition, useLearningState } from "../hooks/useLearningLibrary";
import { learningT } from "../i18n/learning";
import { formatNumerals } from "../formatting";
import { routeToHash } from "../routing";
import type { AppLanguage, TextSizeOption } from "../types";
import type { LearningNode, LearningPack, LearningResource, LearningResourceId, PdfEdition } from "../learning/types";
import "./learn.css";

const emptyBookmarks: string[] = [];

interface LearningReaderProps {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  resourceId: LearningResourceId;
  contentLanguage: LearningLanguage;
  onLanguageChange: (language: LearningLanguage, unitId?: string) => void;
  unitId?: string;
  textSize: TextSizeOption;
  onTextSizeChange: (size: TextSizeOption) => void;
  onUnitChange: (id: string) => void;
  onBack: () => void;
}

/** Resolve availability before mounting any reading, cache, PDF or persistence hooks. */
export function LearningReaderScreen(props: LearningReaderProps) {
  const resource = useMemo(
    () => resolveLearningResource("ar", props.resourceId, props.contentLanguage),
    [props.resourceId, props.contentLanguage],
  );
  if (!resource)
    return (
      <ScreenContainer dir={props.direction} screenName={learningT(props.language, "unavailableTitle")}>
        <div className="mx-auto w-full max-w-2xl space-y-4 overflow-y-auto px-page py-6">
          <h1 className="text-title font-bold">{learningT(props.language, "unavailableTitle")}</h1>
          <p role="status" className="leading-relaxed">
            {learningT(props.language, "unavailable")}
          </p>
          <Button onClick={props.onBack}>
            <ArrowPrevious aria-hidden="true" />
            {learningT(props.language, "back")}
          </Button>
        </div>
      </ScreenContainer>
    );
  return <AvailableLearningReader {...props} resource={resource} />;
}

function AvailableLearningReader({
  language,
  direction,
  resourceId,
  contentLanguage,
  onLanguageChange,
  unitId,
  textSize,
  onTextSizeChange,
  onUnitChange,
  onBack,
  resource,
}: LearningReaderProps & { resource: LearningResource }) {
  const resources = useMemo(() => [resource], [resource]);
  const identity = learningEditionId(resource);
  const editions = useMemo(
    () => learningEditions(language).filter((edition) => edition.id === resourceId),
    [resourceId, language],
  );
  const state = useLearningState();
  const { statuses, job, refresh } = useLearningOffline(resources);
  const pdf = useLearningPdf(resource);
  const [loadedPack, setPack] = useState<LearningPack | null>(null);
  const pack = loadedPack?.language === resource.language ? loadedPack : null;
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [panel, setPanel] = useState<"contents" | "options" | null>(null);
  const [notice, setNotice] = useState<
    "bookmarked" | "bookmarkRemoved" | "sessionOnly" | "sectionUnavailable" | "languageUnavailable" | null
  >(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState(false);
  const [imageAttempt, setImageAttempt] = useState(0);
  const scroll = useRef<HTMLElement>(null);
  const focusReading = useRef(false);
  const unit = pack?.units.find((item) => item.id === unitId);
  const index = unit && pack ? pack.units.indexOf(unit) : 0;
  const bookmarks = state[identity]?.bookmarks || emptyBookmarks;
  const isBookmarked = unit ? bookmarks.includes(unit.id) : false;
  const storageFailure = useCallback(() => setNotice("sessionOnly"), []);
  useLearningPosition(resource, unit?.id, scroll, storageFailure);
  useEffect(() => {
    if (resource.language !== contentLanguage) {
      setNotice("languageUnavailable");
      onLanguageChange(resource.language, readLearningState()[identity]?.position?.unitId);
    }
  }, [resource.language, contentLanguage, identity, onLanguageChange]);

  useEffect(() => {
    const request = new AbortController();
    setPack(null);
    setError(false);
    void loadLearningPack(resource, request.signal)
      .then((loaded) => {
        if (request.signal.aborted) return;
        setPack(loaded);
        void refresh();
      })
      .catch(() => {
        if (!request.signal.aborted) setError(true);
      });
    return () => request.abort();
  }, [resource, attempt, refresh]);

  useEffect(() => {
    if (!pack || unit) return;
    if (unitId) setNotice("sectionUnavailable");
    const saved = readLearningState()[identity]?.position?.unitId;
    const target = [unitId, saved, pack.contents[0]?.unitId, pack.units[0]?.id].find((id) =>
      pack.units.some((item) => item.id === id),
    );
    if (target) onUnitChange(target);
  }, [pack, unit, unitId, identity, onUnitChange]);

  useEffect(() => {
    if (!unit) return;
    const paths = new Set<string>();
    const inspect = (node: LearningNode) => {
      if (typeof node !== "string") {
        if (node.asset) paths.add(node.asset);
        node.children.forEach(inspect);
      }
    };
    unit.nodes.forEach(inspect);
    const request = new AbortController();
    const urls: string[] = [];
    setImages({});
    setImageError(false);
    void Promise.all(
      resource.images
        .filter((asset) => paths.has(asset.path))
        .map(async (asset) => {
          const bytes = await fetchLearningAsset(asset, request.signal, true, identity);
          request.signal.throwIfAborted();
          const url = URL.createObjectURL(new Blob([bytes], { type: asset.mime }));
          urls.push(url);
          setImages((previous) => ({ ...previous, [asset.path]: url }));
        }),
    ).catch(() => {
      if (!request.signal.aborted) setImageError(true);
    });
    return () => {
      request.abort();
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [unit, resource, identity, imageAttempt]);

  const go = (id: string) => {
    setNotice(null);
    const closingPanel = panel !== null;
    focusReading.current = closingPanel;
    onUnitChange(id);
    setPanel(null);
    requestAnimationFrame(() => {
      if (!closingPanel) scroll.current?.focus({ preventScroll: true });
    });
  };
  const linkFor = (id: string) =>
    routeToHash({
      view: "learning_reader",
      learningResourceId: resourceId,
      learningUnitId: id,
      learningLanguage: resource.language,
    })!;
  const openPanel = (name: "contents" | "options", opener: HTMLButtonElement) => {
    // Safari does not focus pointer-activated buttons; establish the real return target.
    opener.focus({ preventScroll: true });
    setPanel(name);
  };
  const bookmark = () => {
    if (!unit) return;
    const saved = updateLearningState(identity, (previous) => ({
      ...previous,
      bookmarks: isBookmarked ? previous.bookmarks.filter((id) => id !== unit.id) : [...previous.bookmarks, unit.id],
    }));
    setNotice(saved ? (isBookmarked ? "bookmarkRemoved" : "bookmarked") : "sessionOnly");
  };

  return (
    <ScreenContainer dir={direction} className="learning-reader" screenName={resource.title}>
      <header className="learn-reader-header">
        <div className="learn-reader-tools">
          <Button variant="ghost" className="learn-compact-action" onClick={onBack}>
            <ArrowPrevious aria-hidden="true" />
            <span className="learn-action-label">{learningT(language, "title")}</span>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="learn-compact-action"
              onClick={(event) => openPanel("contents", event.currentTarget)}
              disabled={!pack}
              aria-haspopup="dialog"
            >
              <List aria-hidden="true" />
              <span className="learn-action-label">{learningT(language, "contents")}</span>
            </Button>
            <Button
              variant="outline"
              className="learn-compact-action"
              onClick={(event) => openPanel("options", event.currentTarget)}
              aria-haspopup="dialog"
            >
              <SlidersHorizontal aria-hidden="true" />
              <span className="learn-action-label">{learningT(language, "options")}</span>
            </Button>
          </div>
        </div>
        <h1
          lang={resource.language}
          dir={resource.language === "ar" ? "rtl" : "ltr"}
          className="text-title font-bold leading-relaxed"
        >
          {resource.title}
        </h1>
      </header>
      <div className="learn-reading-layout">
        {pack && (
          <aside className="learn-sidebar" aria-label={learningT(language, "contents")}>
            <LearningContents
              language={language}
              direction={direction}
              pack={pack}
              unitId={unitId}
              bookmarks={bookmarks}
              linkFor={linkFor}
              onNavigate={go}
            />
          </aside>
        )}
        <div className="learn-reading-main">
          {!pack && (
            <div className="space-y-4 overflow-y-auto p-6" role={error ? "alert" : "status"}>
              <p>{learningT(language, error ? "loadError" : "loading")}</p>
              {error && (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setAttempt((value) => value + 1)}>{learningT(language, "retry")}</Button>
                  <Button variant="outline" onClick={(event) => openPanel("options", event.currentTarget)}>
                    <Download aria-hidden="true" />
                    {learningT(language, "pdf")}
                  </Button>
                </div>
              )}
            </div>
          )}
          {unit && (
            <section
              ref={scroll}
              tabIndex={0}
              aria-label={`${resource.title} · ${learningT(language, "sourcePage", { page: formatNumerals(unit.sourcePage, language) })}`}
              className="learn-reading-scroll"
              data-testid="learning-reading-scroll"
            >
              <div className="learn-reading-measure">
                {pack?.previousEdition && (
                  <p role="status" className="learn-draft-notice text-sm">
                    {learningT(language, "previousEdition")}
                  </p>
                )}
                {learningEditionNotice(language, resource) && (
                  <p className="learn-draft-notice text-sm" role="note">
                    {learningEditionNotice(language, resource)}
                  </p>
                )}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    {learningT(language, "sourcePage", { page: formatNumerals(unit.sourcePage, language) })}
                  </p>
                  <Button
                    variant="ghost"
                    className="learn-compact-action"
                    aria-pressed={isBookmarked}
                    onClick={bookmark}
                  >
                    {isBookmarked ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
                    <span className="learn-action-label">
                      {learningT(language, isBookmarked ? "removeBookmark" : "bookmark")}
                    </span>
                  </Button>
                </div>
                {imageError && (
                  <div className="mb-3 text-sm" role="status">
                    <p>{learningT(language, "imageError")}</p>
                    <Button variant="outline" onClick={() => setImageAttempt((value) => value + 1)}>
                      {learningT(language, "retry")}
                    </Button>
                  </div>
                )}
                <article
                  className="learn-prose"
                  data-text-size={textSize}
                  lang={resource.language}
                  dir={resource.language === "ar" ? "rtl" : "ltr"}
                  data-testid="learning-content"
                >
                  <LearningContent nodes={unit.nodes} images={images} linkFor={linkFor} onNavigate={go} />
                </article>
                {pack && index === pack.units.length - 1 && (
                  <p className="mt-6 text-sm text-muted-foreground">{learningT(language, "end")}</p>
                )}
              </div>
            </section>
          )}
          {unit && pack && (
            <footer className="learn-reader-footer">
              <p className="text-sm text-muted-foreground">
                {learningT(language, "position", {
                  current: formatNumerals(index + 1, language),
                  total: formatNumerals(pack.units.length, language),
                })}
              </p>
              <nav aria-label={learningT(language, "title")} className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="learn-compact-action"
                  disabled={index === 0}
                  onClick={() => go(pack.units[index - 1]!.id)}
                >
                  <ChevronPrevious aria-hidden="true" />
                  <span className="learn-action-label">{learningT(language, "previous")}</span>
                </Button>
                <Button
                  className="learn-compact-action"
                  disabled={index === pack.units.length - 1}
                  onClick={() => go(pack.units[index + 1]!.id)}
                >
                  <span className="learn-action-label">{learningT(language, "next")}</span>
                  <ChevronNext aria-hidden="true" />
                </Button>
              </nav>
            </footer>
          )}
        </div>
      </div>
      <p role="status" className={notice ? "learn-reader-notice text-sm" : "sr-only"}>
        {notice ? learningT(language, notice) : ""}
      </p>
      <Modal
        open={panel !== null}
        onClose={() => setPanel(null)}
        protectedSurface
        title={learningT(language, panel === "contents" ? "contents" : "options")}
        language={language}
        direction={direction}
        showCloseButton={false}
        onCloseAutoFocus={(event) => {
          if (focusReading.current) {
            event.preventDefault();
            scroll.current?.focus({ preventScroll: true });
            focusReading.current = false;
          }
        }}
      >
        <SheetHeader
          className="learn-sheet-header"
          title={learningT(language, panel === "contents" ? "contents" : "options")}
          language={language}
          direction={direction}
          onClose={() => setPanel(null)}
        />
        {panel === "contents" && pack && (
          <LearningContents
            language={language}
            direction={direction}
            pack={pack}
            unitId={unitId}
            bookmarks={bookmarks}
            linkFor={linkFor}
            onNavigate={go}
          />
        )}
        {panel === "options" && (
          <div className="space-y-6 overflow-y-auto p-4">
            <LearningLanguageChoices
              language={language}
              value={resource.language}
              choices={editions.map((edition) => edition.language)}
              onChange={(nextLanguage) => {
                const next = editions.find((edition) => edition.language === nextLanguage)!;
                const saved = updateLearningState(resourceId, (previous) => ({
                  ...previous,
                  contentLanguage: nextLanguage,
                }));
                if (!saved) setNotice("sessionOnly");
                onLanguageChange(nextLanguage, state[learningEditionId(next)]?.position?.unitId || unit?.id);
              }}
            />
            <fieldset>
              <legend className="mb-2 font-bold">{learningT(language, "textSize")}</legend>
              <div className="flex flex-wrap gap-2">
                {(["small", "medium", "large"] as const).map((size) => (
                  <label key={size} className="learn-radio">
                    <input
                      type="radio"
                      name="learn-text-size"
                      checked={textSize === size}
                      onChange={() => onTextSizeChange(size)}
                    />
                    {learningT(language, size)}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{learningT(language, "sizeHelp")}</p>
            </fieldset>
            <section aria-label={learningT(language, "offlineTitle")} className="space-y-2">
              <h2 className="font-bold">{learningT(language, "offlineTitle")}</h2>
              <LearningOfflineActions
                language={language}
                resourceId={identity}
                status={statuses[identity]}
                job={job}
                onSave={() => void startLearningDownload(resource)}
                onCancel={cancelLearningDownload}
              />
            </section>
            <section aria-label={learningT(language, "pdf")} className="space-y-3">
              <h2 className="font-bold">{learningT(language, "pdf")}</h2>
              <p className="text-sm text-muted-foreground">{learningT(language, "pdfHelp")}</p>
              <fieldset disabled={pdf.phase === "busy"}>
                <legend className="mb-2 text-sm font-semibold">{learningT(language, "edition")}</legend>
                <div className="flex flex-wrap gap-2">
                  {(["light", "dark", "navy"] as PdfEdition[]).map((edition) => (
                    <label key={edition} className="learn-radio">
                      <input
                        type="radio"
                        name="learn-pdf-edition"
                        checked={pdf.edition === edition}
                        onChange={() => pdf.setEdition(edition)}
                      />
                      {learningT(language, edition)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Button disabled={pdf.phase === "busy"} onClick={() => void pdf.download()}>
                <Download aria-hidden="true" />
                {learningT(language, pdf.phase === "busy" ? "pdfBusy" : "pdf")}
              </Button>
              <p role={pdf.phase === "failed" ? "alert" : "status"} className="text-sm">
                {pdf.phase === "saved"
                  ? learningT(language, "pdfSaved")
                  : pdf.phase === "failed"
                    ? learningT(language, "pdfFailed")
                    : ""}
              </p>
            </section>
            {learningEditionNotice(language, resource) && (
              <details>
                <summary className="min-h-11 cursor-pointer py-2 font-semibold">
                  {learningT(language, "editionStatus")}
                </summary>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {learningEditionNotice(language, resource, true)}
                </p>
              </details>
            )}
            {pack && (
              <Button variant="outline" onClick={() => go(pack.units[0]!.id)}>
                {learningT(language, "source")}
              </Button>
            )}
            <p className="text-sm text-muted-foreground">{learningT(language, "localProgress")}</p>
          </div>
        )}
      </Modal>
    </ScreenContainer>
  );
}
