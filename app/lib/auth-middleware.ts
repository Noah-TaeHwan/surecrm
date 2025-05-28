import { redirect } from 'react-router';
import { getCurrentUser } from './auth';

/**
 * 인증이 필요한 라우트에서 사용하는 미들웨어
 */
export async function requireAuth(request: Request) {
  const user = await getCurrentUser(request);

  if (!user) {
    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    throw redirect('/auth/login');
  }

  if (!user.isActive) {
    // 비활성화된 사용자는 접근 거부
    throw redirect('/auth/login?error=account-disabled');
  }

  return user;
}

/**
 * 어드민 권한이 필요한 라우트에서 사용하는 미들웨어
 */
export async function requireAdmin(request: Request) {
  const user = await requireAuth(request);

  if (user.role !== 'admin') {
    // 어드민이 아닌 사용자는 대시보드로 리다이렉트
    throw redirect('/dashboard?error=access-denied');
  }

  return user;
}

/**
 * 이미 로그인된 사용자가 접근하면 안 되는 라우트 (로그인, 회원가입 등)
 */
export async function requireGuest(request: Request) {
  const user = await getCurrentUser(request);

  if (user && user.isActive) {
    // 이미 로그인된 사용자는 대시보드로 리다이렉트
    throw redirect('/dashboard');
  }

  return null;
}
