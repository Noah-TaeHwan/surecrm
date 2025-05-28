import { redirect } from 'react-router';

/**
 * 현재 로그인한 사용자의 ID를 가져옵니다.
 * 실제 구현에서는 세션이나 JWT에서 추출해야 합니다.
 * 지금은 임시로 하드코딩된 값을 반환합니다.
 */
export function getCurrentUserId(request: Request): string {
  // TODO: 실제 인증 로직 구현
  // 예시: 쿠키나 헤더에서 JWT 토큰을 파싱하여 사용자 ID 추출

  // 임시 하드코딩 (개발용)
  const mockUserId = 'mock-agent-id-1';

  if (!mockUserId) {
    throw redirect('/login');
  }

  return mockUserId;
}

/**
 * 사용자가 로그인되어 있는지 확인합니다.
 */
export function requireAuth(request: Request): string {
  try {
    return getCurrentUserId(request);
  } catch (error) {
    throw redirect('/login');
  }
}

/**
 * 사용자가 특정 리소스에 접근할 권한이 있는지 확인합니다.
 */
export function checkResourceAccess(
  userId: string,
  resourceOwnerId: string
): boolean {
  // 기본적으로 자신의 리소스에만 접근 가능
  return userId === resourceOwnerId;
}
