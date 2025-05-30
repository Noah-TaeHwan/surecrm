import { redirect } from 'react-router';

// 현재 사용자 ID 가져오기 (임시 구현)
export async function getCurrentUserId(request: Request): Promise<string> {
  // TODO: 실제 인증 시스템 연결
  // 현재는 실제 데이터베이스에 존재하는 사용자 ID 반환
  return '7ad6a8a0-9119-408e-92a0-a9970e721356';
}

// 인증 확인 및 사용자 ID 반환
export async function requireAuth(request: Request): Promise<string> {
  const userId = await getCurrentUserId(request);

  if (!userId) {
    throw redirect('/login');
  }

  return userId;
}
