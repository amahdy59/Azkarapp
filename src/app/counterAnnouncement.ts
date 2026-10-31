/** Short counts speak each step; longer sessions remain quiet between milestones. */
export function shouldAnnounceCount(count: number, target: number): boolean {
  return count > 0 && (target <= 10 || count >= target || count % 10 === 0 || count === Math.floor(target / 2));
}
