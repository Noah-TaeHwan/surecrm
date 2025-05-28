import { redirect } from 'react-router';

// 현재 사용자 ID 가져오기 (임시 구현)
export async function getCurrentUserId(request: Request): Promise<string> {
  // TODO: 실제 인증 시스템 연결
  // 현재는 하드코딩된 사용자 ID 반환
  return 'user-1';
}

// 인증 확인 및 사용자 ID 반환
export async function requireAuth(request: Request): Promise<string> {
  const userId = await getCurrentUserId(request);

  if (!userId) {
    throw redirect('/login');
  }

  return userId;
}

// 요청에서 검색 파라미터 추출
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
