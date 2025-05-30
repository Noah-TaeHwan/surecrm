import { redirect } from 'react-router';
import { getCurrentUser } from './core';

/**
 * 현재 로그인한 사용자의 ID를 가져옵니다. (비동기 버전)
 * 실제 인증 시스템과 연결된 구현입니다.
 */
export async function getCurrentUserId(request: Request): Promise<string> {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      throw redirect('/login');
    }

    return user.id;
  } catch (error) {
    console.error('getCurrentUserId 오류:', error);
    throw redirect('/login');
  }
}

/**
 * 현재 로그인한 사용자의 ID를 가져옵니다. (동기 버전)
 * 주로 action 함수에서 사용됩니다.
 * TODO: 실제 구현에서는 세션에서 직접 추출하도록 수정 필요
 */
export function getCurrentUserIdSync(request: Request): string {
  // 임시 구현: 개발용 하드코딩
  // 실제로는 세션 쿠키에서 바로 추출해야 함
  const mockUserId = 'mock-agent-id-1';

  if (!mockUserId) {
    throw redirect('/login');
  }

  return mockUserId;
}

/**
 * 인증 확인 및 사용자 ID 반환 (비동기 버전)
 * 사용자가 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
 */
export async function requireAuth(request: Request): Promise<string> {
  return await getCurrentUserId(request);
}

/**
 * 인증 확인 및 사용자 ID 반환 (동기 버전)
 * 주로 action 함수에서 사용됩니다.
 */
export function requireAuthSync(request: Request): string {
  return getCurrentUserIdSync(request);
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

/**
 * 요청에서 검색 파라미터 추출 (공통 유틸리티)
 */
export function getSearchParams(request: Request) {
  const url = new URL(request.url);
  return {
    page: parseInt(url.searchParams.get('page') || '1'),
    pageSize: parseInt(url.searchParams.get('pageSize') || '10'),
    search: url.searchParams.get('search') || '',
    stage: url.searchParams.get('stage') || 'all',
    importance: url.searchParams.get('importance') || 'all',
    sortBy: url.searchParams.get('sortBy') || 'name',
    sortOrder: (url.searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc',
  };
}
