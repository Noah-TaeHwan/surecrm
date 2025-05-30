/**
 * 페이지네이션 유틸리티
 */
export function getPaginationParams(
  page: number = 1,
  pageSize: number = 10
): { offset: number; limit: number } {
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), 100); // 최대 100개

  return {
    offset: (validPage - 1) * validPageSize,
    limit: validPageSize,
  };
}
