/** Search normalization never changes the reviewed text rendered to the reader. */
export function normalizeDhikrSearch(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u064b-\u065f\u0670\u0640]/gu, "")
    .replace(/[إأآٱ]/gu, "ا")
    .toLocaleLowerCase()
    .trim();
}

export function parseMasbahaTarget(value: string): number | null {
  const digits = value
    .trim()
    .replace(/[٠-٩]/gu, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/gu, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
  if (!/^\d+$/u.test(digits)) return null;
  const target = Number(digits);
  return Number.isInteger(target) && target >= 1 && target <= 100000 ? target : null;
}
