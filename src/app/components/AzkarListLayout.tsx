import { ReactNode } from "react";
import type { Zikr, ZikrGroupId, RitualGroupId, CategoryId } from "../types";

import { t } from "../i18n";
import { formatNumerals, numeralFontFamily } from "../formatting";

type OrderedZikr = { z: Zikr; index: number };

export function AzkarListLayout({
  azkar,
  completed,
  catId,
  isMainRoutine,
  routineMode,
  language,
  renderZikrCard,
}: {
  azkar: Zikr[];
  completed: ReadonlySet<string> | Set<string>;
  catId: CategoryId;
  isMainRoutine: boolean;
  routineMode: "complete" | "core";
  language: "ar" | "en";
  renderZikrCard: (item: OrderedZikr, isCompleted: boolean) => ReactNode;
}) {
  const orderedAzkar = azkar.map((z, i) => ({ z, index: i }));

  const groupedAzkar = orderedAzkar.reduce<Array<{ groupId: ZikrGroupId; items: typeof orderedAzkar }>>(
    (groups, item) => {
      const groupId = item.z.groupId ?? "ask";
      const existing = groups.find((group) => group.groupId === groupId);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.push({ groupId, items: [item] });
      }
      return groups;
    },
    [],
  );

  const groupLabel = (groupId: ZikrGroupId) => {
    const keys: Record<ZikrGroupId, string> = {
      begin: "category.groupBegin",
      quran_protection: "category.groupQuranProtection",
      dua_protection: "category.groupDuaProtection",
      renew: "category.groupRenew",
      ask: "category.groupAsk",
      repeat: "category.groupRepeat",
      prepare: "category.prepareTitle",
      settle: "category.groupSettle",
      final: "category.groupFinal",
    };
    return t(language, keys[groupId] || "category.groupBegin");
  };

  const ritualChunks = (items: typeof orderedAzkar) =>
    items.reduce<Array<{ ritualGroupId?: RitualGroupId; items: typeof orderedAzkar }>>((chunks, item) => {
      const previous = chunks.length > 0 ? chunks[chunks.length - 1] : undefined;
      if (item.z.ritualGroupId && previous && previous.ritualGroupId === item.z.ritualGroupId) {
        previous.items.push(item);
      } else {
        chunks.push({ ritualGroupId: item.z.ritualGroupId, items: [item] });
      }
      return chunks;
    }, []);

  const stepProgress = (items: typeof orderedAzkar) => {
    const rituals = new Map<RitualGroupId, typeof orderedAzkar>();
    const standalone = items.filter((item) => {
      if (!item.z.ritualGroupId) return true;
      const ritualItems = rituals.get(item.z.ritualGroupId) ?? [];
      ritualItems.push(item);
      rituals.set(item.z.ritualGroupId, ritualItems);
      return false;
    });
    return {
      total: standalone.length + rituals.size,
      done:
        standalone.filter((item) => completed.has(item.z.id)).length +
        Array.from(rituals.values()).filter((ritualItems) => ritualItems.every((item) => completed.has(item.z.id)))
          .length,
    };
  };

  if (groupedAzkar.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {orderedAzkar.map((item) => renderZikrCard(item, completed.has(item.z.id)))}
      </div>
    );
  }

  if (!isMainRoutine) {
    return (
      <div
        className={`mb-6 flex flex-col ${
          routineMode === "core"
            ? "gap-0 divide-y divide-border/20 rounded-2xl border border-border/30 bg-card overflow-hidden"
            : "gap-2"
        }`}
      >
        {orderedAzkar.map((item) => renderZikrCard(item, completed.has(item.z.id)))}
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col gap-6">
      {groupedAzkar.map((group) => {
        const groupProgress = stepProgress(group.items);
        return (
          <section key={group.groupId} aria-labelledby={`group-${group.groupId}`}>
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <h2 id={`group-${group.groupId}`} className="text-sm font-extrabold text-foreground">
                {groupLabel(group.groupId)}
              </h2>
              <span
                className="text-xs font-bold text-muted-foreground"
                style={{ fontFamily: numeralFontFamily(language) }}
              >
                {t(language, "category.groupProgress", {
                  done: formatNumerals(groupProgress.done, language),
                  total: formatNumerals(groupProgress.total, language),
                })}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {ritualChunks(group.items).map((chunk, chunkIndex) =>
                chunk.ritualGroupId ? (
                  <div
                    key={chunk.ritualGroupId}
                    className={`rounded-3xl border ${
                      routineMode === "core"
                        ? "border-border/30 bg-card overflow-hidden"
                        : "border-primary/25 bg-primary/5 p-3"
                    }`}
                    data-ritual-group={chunk.ritualGroupId}
                  >
                    <div className={`mb-3 px-1 ${routineMode === "core" ? "p-3 pb-0" : ""}`}>
                      <h3 className="text-label font-extrabold text-primary">
                        {t(
                          language,
                          chunk.ritualGroupId === "three_quls" ? "category.ritualThreeQuls" : "category.ritualTasbih",
                        )}
                      </h3>
                      <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
                        {t(
                          language,
                          chunk.ritualGroupId === "three_quls" && catId === "before_sleep"
                            ? "category.ritualSleepInstruction"
                            : chunk.ritualGroupId === "three_quls"
                              ? "category.ritualThreeQulsInstruction"
                              : "category.ritualTasbihInstruction",
                        )}
                      </p>
                    </div>
                    <div
                      className={`flex flex-col ${
                        routineMode === "core" ? "gap-0 divide-y divide-border/20" : "gap-3"
                      }`}
                    >
                      {chunk.items.map((item) => renderZikrCard(item, completed.has(item.z.id)))}
                    </div>
                  </div>
                ) : (
                  <div
                    key={`${group.groupId}-${chunkIndex}`}
                    className={`flex flex-col ${
                      routineMode === "core"
                        ? "gap-0 divide-y divide-border/20 rounded-2xl border border-border/30 bg-card overflow-hidden"
                        : "gap-2"
                    }`}
                  >
                    {chunk.items.map((item) => renderZikrCard(item, completed.has(item.z.id)))}
                  </div>
                ),
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
