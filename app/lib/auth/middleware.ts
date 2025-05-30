import { redirect } from 'react-router';
import { getCurrentUser } from './core';

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
 * 🔒 Admin 백오피스 전용 보안 미들웨어
 * 시스템 관리자(system_admin)만 접근 가능
 * 보안 최우선: 일반 사용자와 완전 분리
 */
export async function requireAdmin(request: Request) {
  const user = await requireAuth(request);

  // 🚨 시스템 관리자만 Admin 백오피스 접근 허용
  if (user.role !== 'system_admin') {
    console.warn(`Admin 접근 거부: ${user.id} (${user.role}) - ${request.url}`);

    // 일반 사용자는 대시보드로 강제 리다이렉트
    throw redirect('/dashboard?error=admin-access-denied');
  }

  // 🔍 Admin 접근 로깅 (보안 감사용)
  console.log(
    `Admin 접근 승인: ${user.id} (${user.fullName}) - ${request.url}`
  );

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
