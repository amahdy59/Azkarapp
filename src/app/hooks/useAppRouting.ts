import { useState, useRef, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
import { parseLocation, routeToHash } from "../routing";
import { getAzkarForMode, isRoutineCategory, registerLazyCollection } from "../content/azkar";
import { reportError } from "../../lib/observability";
import { startSafeViewTransition } from "../utils/viewTransitions";
import type { CategoryId, PrayerName, RoutineMode, View, RoutineCategoryId } from "../types";
import type { LibrarySection } from "../screens/AzkarLibraryScreen";

function categoryFromShortcutUrl(): CategoryId | null {
  const category = new URLSearchParams(window.location.search).get("category");
  return category === "morning" || category === "evening" || category === "before_sleep" ? category : null;
}

export function isLazyRouteCategory(categoryId: CategoryId): boolean {
  return categoryId === "comprehensive_duas" || categoryId === "friday_kahf";
}

export async function loadLazyRouteCategory(categoryId: CategoryId) {
  if (categoryId === "comprehensive_duas") {
    const { COMPREHENSIVE_DUAS } = await import("../content/comprehensiveDuas");
    registerLazyCollection(categoryId, COMPREHENSIVE_DUAS);
  } else if (categoryId === "friday_kahf") {
    const { FRIDAY_KAHF } = await import("../content/fridayKahf");
    registerLazyCollection(categoryId, FRIDAY_KAHF);
  }
}

export type NavTab = "home" | "azkar" | "progress" | "settings";

export function tabForView(view: View): NavTab {
  if (view === "settings") return "settings";
  if (view === "progress") return "progress";
  if (view === "library" || view === "category" || view === "reader") return "azkar";
  return "home";
}

interface UseAppRoutingProps {
  routineModes: Record<RoutineCategoryId, RoutineMode>;
  hasCompletedOnboarding: boolean;
}

export function useAppRouting({ routineModes, hasCompletedOnboarding }: UseAppRoutingProps) {
  const initialRoute = useRef(parseLocation(window.location.search, window.location.hash)).current;
  const initialShortcutCategory = useRef(categoryFromShortcutUrl()).current;

  const [view, setView] = useState<View>(() => initialRoute?.view ?? "splash");
  const initialHistoryView = useRef(view).current;

  const [activeTab, setActiveTab] = useState<NavTab>(() => tabForView(initialRoute?.view ?? "home"));
  const [activeCat, setActiveCat] = useState<CategoryId>(initialRoute?.categoryId ?? "morning");
  const [activeSubCategory, setActiveSubCategory] = useState<string | undefined>(undefined);
  const [activeIdx, setActiveIdx] = useState(initialRoute?.index ?? 0);
  const [quranPage, setQuranPage] = useState<number | undefined>(initialRoute?.page);
  /** Which prayer the prayer screen is showing, so `#/prayer/asr` survives a reload. */
  const [activePrayer, setActivePrayer] = useState<PrayerName>(initialRoute?.prayer ?? "fajr");
  const [searchQuery, setSearchQuery] = useState(initialRoute?.query ?? "");
  const [librarySection, setLibrarySection] = useState<LibrarySection>("collections");

  const [routeContentLoading, setRouteContentLoading] = useState(
    () =>
      initialRoute?.view === "reader" ||
      Boolean(initialRoute?.categoryId && isLazyRouteCategory(initialRoute.categoryId)),
  );
  const [routeContentError, setRouteContentError] = useState<{
    categoryId: CategoryId;
    targetView: View;
    targetIndex: number;
  } | null>(null);

  const routeLoadId = useRef(0);
  const inAppHistoryDepth = useRef(0);

  const hydrateRouteCategory = useCallback(
    async (categoryId: CategoryId, targetView: View, targetIndex = 0) => {
      const loadId = ++routeLoadId.current;
      setRouteContentLoading(true);
      setRouteContentError(null);
      try {
        await loadLazyRouteCategory(categoryId);
        if (loadId !== routeLoadId.current) return;

        const mode = isRoutineCategory(categoryId) ? routineModes[categoryId as RoutineCategoryId] : "complete";
        const items = getAzkarForMode(categoryId, mode);
        if (targetView === "reader" && (targetIndex < 0 || targetIndex >= items.length)) {
          setActiveIdx(0);
          setView(items.length > 0 ? "category" : "library");
        }
        return true;
      } catch (error) {
        reportError(error, "route-content-load");
        if (loadId === routeLoadId.current) {
          setRouteContentError({ categoryId, targetView, targetIndex });
        }
        return false;
      } finally {
        if (loadId === routeLoadId.current) setRouteContentLoading(false);
      }
    },
    [routineModes],
  );

  const push = useCallback((to: View) => {
    window.history.pushState({ view: to }, "", window.location.href);
    inAppHistoryDepth.current += 1;
    startSafeViewTransition(() => {
      flushSync(() => {
        setView(to);
      });
    });
  }, []);

  const pop = useCallback(() => {
    if (inAppHistoryDepth.current > 0) {
      window.history.back();
    } else {
      push("home");
    }
  }, [push]);

  useEffect(() => {
    if (initialRoute?.categoryId && (initialRoute.view === "reader" || isLazyRouteCategory(initialRoute.categoryId))) {
      void hydrateRouteCategory(initialRoute.categoryId, initialRoute.view, initialRoute.index);
    }
  }, [hydrateRouteCategory, initialRoute]);

  useEffect(() => {
    if (!window.history.state?.view) {
      window.history.replaceState({ view: initialHistoryView }, "", window.location.href);
    }
  }, [initialHistoryView]);

  useEffect(() => {
    const hash = routeToHash({
      view,
      categoryId: activeCat,
      index: activeIdx,
      query: searchQuery,
      page: quranPage,
      prayer: activePrayer,
    });
    if (!hash) return;
    const target = `${window.location.pathname}${hash}`;
    if (`${window.location.pathname}${window.location.hash}` !== target) {
      window.history.replaceState({ view }, "", target);
    }
  }, [view, activeCat, activeIdx, searchQuery, quranPage, activePrayer]);

  const applyRouteFromLocation = useCallback((): boolean => {
    const route = parseLocation(window.location.search, window.location.hash);
    if (!route) return false;

    startSafeViewTransition(() => {
      flushSync(() => {
        setView(route.view);
        if (route.page !== undefined) setQuranPage(route.page);
        if (route.prayer) setActivePrayer(route.prayer);
        if (route.categoryId) {
          setActiveCat(route.categoryId);
          if (route.view === "reader" || isLazyRouteCategory(route.categoryId)) {
            void hydrateRouteCategory(route.categoryId, route.view, route.index);
          } else {
            routeLoadId.current += 1;
            setRouteContentLoading(false);
          }
        } else {
          routeLoadId.current += 1;
          setRouteContentLoading(false);
        }
        if (route.index !== undefined) setActiveIdx(route.index);
        if (route.query !== undefined) setSearchQuery(route.query);
        setActiveTab(tabForView(route.view));
      });
    });
    return true;
  }, [hydrateRouteCategory]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      inAppHistoryDepth.current = Math.max(0, inAppHistoryDepth.current - 1);
      if (applyRouteFromLocation()) return;
      if (e.state?.view) {
        startSafeViewTransition(() => {
          flushSync(() => {
            setView(e.state.view);
            setActiveTab(tabForView(e.state.view));
          });
        });
      } else {
        startSafeViewTransition(() => {
          flushSync(() => {
            setView(hasCompletedOnboarding ? "home" : "language");
          });
        });
      }
    };

    const handleHashChange = () => {
      applyRouteFromLocation();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [applyRouteFromLocation, hasCompletedOnboarding]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable ||
          activeEl.getAttribute("role") === "textbox")
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setView("search");
        return;
      }

      if (e.key === "/" && view !== "reader" && view !== "custom_counter") {
        e.preventDefault();
        setView("search");
        return;
      }

      if (e.altKey) {
        if (e.key === "1") {
          e.preventDefault();
          setActiveTab("home");
          setView("home");
        } else if (e.key === "2") {
          e.preventDefault();
          setActiveTab("azkar");
          setView("library");
        } else if (e.key === "3") {
          e.preventDefault();
          setActiveTab("progress");
          setView("progress");
        } else if (e.key === "4") {
          e.preventDefault();
          setActiveTab("settings");
          setView("settings");
        } else if (e.key === "5") {
          e.preventDefault();
          setView("custom_counter");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view]);

  useEffect(() => {
    if (view !== "home") return;
    const category = initialShortcutCategory;
    if (!category) return;
    setActiveCat(category);
    setActiveTab("azkar");
    setView("category");
    window.history.replaceState(null, "", window.location.pathname);
  }, [initialShortcutCategory, view]);

  const handleNavTab = useCallback(
    (tab: NavTab) => {
      setActiveTab(tab);
      if (tab === "home") {
        push("home");
      } else if (tab === "azkar") {
        setLibrarySection("collections");
        push("library");
      } else if (tab === "progress") {
        push("progress");
      } else if (tab === "settings") {
        push("settings");
      }
    },
    [push],
  );

  return {
    view,
    setView,
    activeTab,
    setActiveTab,
    activeCat,
    setActiveCat,
    activeSubCategory,
    setActiveSubCategory,
    activePrayer,
    setActivePrayer,
    activeIdx,
    setActiveIdx,
    quranPage,
    setQuranPage,
    searchQuery,
    setSearchQuery,
    librarySection,
    setLibrarySection,
    routeContentLoading,
    routeContentError,
    setRouteContentError,
    push,
    pop,
    handleNavTab,
    hydrateRouteCategory,
  };
}
