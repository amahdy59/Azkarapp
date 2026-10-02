export interface PaginatableItem {
  arabicText: string;
  benefitArabic?: string;
  repetitionCount?: number;
}

export interface PartitionedPage<T> {
  pageNumber: number; // 1-indexed
  totalPages: number;
  items: T[];
  estimatedHeight: number;
}

export interface CollectionPaginatorOptions {
  /** Target number of pages to generate (default: 5). */
  targetPages?: number;
  /** Maximum items permitted on a single 1080x1920 slide (default: 7). */
  maxItemsPerPage?: number;
  /** Minimum items per page if available (default: 2). */
  minItemsPerPage?: number;
}

/**
 * Calculates an approximate vertical card height for layout balancing.
 */
export function estimateZikrCardWeight(item: PaginatableItem): number {
  const charCount = item.arabicText?.length ?? 0;
  let textLines = 1;
  if (charCount > 350) {
    textLines = 8;
  } else if (charCount > 220) {
    textLines = 5;
  } else if (charCount > 120) {
    textLines = 3;
  } else if (charCount > 50) {
    textLines = 2;
  }

  const basePaddingAndHeader = 120;
  const lineLineHeight = 44;
  const textHeight = textLines * lineLineHeight;
  const benefitBonus = item.benefitArabic ? 40 : 0;

  return basePaddingAndHeader + textHeight + benefitBonus;
}

/**
 * Partitions a collection of items sequentially into pages,
 * ensuring each group has 3 to 4 cards max (unless total items < 3),
 * balancing height and item counts across pages without breaking original sequence order.
 */
export function paginateCollection<T extends PaginatableItem>(
  items: readonly T[],
  options: CollectionPaginatorOptions = {},
): PartitionedPage<T>[] {
  if (!items || items.length === 0) {
    return [];
  }

  const totalItems = items.length;

  // Single page if 4 or fewer items
  if (totalItems <= 4 && !options.targetPages) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        items: [...items],
        estimatedHeight: items.reduce((acc, item) => acc + estimateZikrCardWeight(item), 0),
      },
    ];
  }

  // Desired pages: default to ceil(N / 4) so every page has 3-4 items, or honor options.targetPages
  const defaultPages = Math.ceil(totalItems / 4);
  const desiredPages = Math.max(1, Math.min(options.targetPages ?? defaultPages, totalItems));

  // If there are as many or fewer items than desired pages, assign 1 item per page
  if (totalItems <= desiredPages) {
    return items.map((item, idx) => ({
      pageNumber: idx + 1,
      totalPages: totalItems,
      items: [item],
      estimatedHeight: estimateZikrCardWeight(item),
    }));
  }

  const weights = items.map(estimateZikrCardWeight);
  const minAllowed = Math.min(options.minItemsPerPage ?? 3, Math.floor(totalItems / desiredPages));
  const maxAllowed = Math.max(options.maxItemsPerPage ?? 4, Math.ceil(totalItems / desiredPages));

  const pages: T[][] = [];
  let itemIndex = 0;
  let remainingItems = totalItems;
  let pagesLeft = desiredPages;
  let remainingWeight = weights.reduce((acc, w) => acc + w, 0);

  while (pagesLeft > 0 && itemIndex < totalItems) {
    if (pagesLeft === 1) {
      // Last page gets all remaining items
      const slice = items.slice(itemIndex);
      pages.push(slice);
      break;
    }

    const minItemsForCurrent = Math.max(minAllowed, remainingItems - maxAllowed * (pagesLeft - 1));
    const maxItemsForCurrent = Math.min(maxAllowed, remainingItems - minAllowed * (pagesLeft - 1));

    const targetWeight = remainingWeight / pagesLeft;

    // Pick between minItemsForCurrent .. maxItemsForCurrent that best matches targetWeight
    let bestCount = minItemsForCurrent;
    let bestDiff = Infinity;

    for (let c = minItemsForCurrent; c <= maxItemsForCurrent; c += 1) {
      let weightForC = 0;
      for (let k = 0; k < c; k += 1) {
        weightForC += weights[itemIndex + k] ?? 0;
      }
      const diff = Math.abs(weightForC - targetWeight);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestCount = c;
      }
    }

    const slice = items.slice(itemIndex, itemIndex + bestCount);
    pages.push(slice);

    let chosenWeight = 0;
    for (let k = 0; k < bestCount; k += 1) {
      chosenWeight += weights[itemIndex + k] ?? 0;
    }

    itemIndex += bestCount;
    remainingItems -= bestCount;
    remainingWeight -= chosenWeight;
    pagesLeft -= 1;
  }

  const finalTotalPages = pages.length;
  return pages.map((pageItems, idx) => ({
    pageNumber: idx + 1,
    totalPages: finalTotalPages,
    items: pageItems,
    estimatedHeight: pageItems.reduce((acc, item) => acc + estimateZikrCardWeight(item), 0),
  }));
}
