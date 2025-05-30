/**
 * 날짜 범위 유틸리티
 */
export function getDateRange(
  period: 'today' | 'week' | 'month' | 'quarter' | 'year'
) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1),
      };

    case 'week':
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      return {
        start: startOfWeek,
        end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1),
      };

    case 'month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      };

    case 'quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      return {
        start: new Date(now.getFullYear(), quarterStart, 1),
        end: new Date(now.getFullYear(), quarterStart + 3, 0, 23, 59, 59),
      };

    case 'year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
      };

    default:
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
  }
}
