/** Public contacts selected by the owner; opening a draft never sends a message. */
export const SUPPORT_EMAILS = ["amahdy59@yahoo.com", "m.hussien.m44@gmail.com"] as const;
export function supportEmailHref(subject?: string) {
  return `mailto:${SUPPORT_EMAILS.join(",")}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}
