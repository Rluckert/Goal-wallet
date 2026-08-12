/**
 * Pure progress calculation, mirroring the rounding/clamping rule the web/
 * micro-app uses in src/render.ts — kept independent (not imported across
 * packages), same as the postMessage contract.
 */
export function computeProgressPercent(savedAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) {
    return 0;
  }
  const raw = (savedAmount / targetAmount) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export function isProgressComplete(percent: number): boolean {
  return percent >= 100;
}
