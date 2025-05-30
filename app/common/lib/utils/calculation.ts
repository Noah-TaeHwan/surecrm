/**
 * 성장률 계산
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

/**
 * 백분율 계산
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 100 * 10) / 10;
}
