/**
 * 검색 쿼리 정리
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[%_]/g, '\\$&') // SQL LIKE 특수문자 이스케이프
    .substring(0, 100); // 최대 100자
}
