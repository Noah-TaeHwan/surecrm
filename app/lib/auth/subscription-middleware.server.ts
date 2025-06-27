import { redirect } from 'react-router';

/**
 * 보호된 라우트에서 구독 상태를 확인하는 미들웨어
 * 체험 기간이 종료된 경우 billing 페이지로 강제 리다이렉트
 */
export async function requireActiveSubscription(request: Request) {
  const { getCurrentUser } = await import('./core.server');
  const user = await getCurrentUser(request);

  if (!user) {
    throw redirect('/auth/login');
  }

  const { getUserSubscriptionStatus } = await import('./subscription');
  const subscriptionStatus = await getUserSubscriptionStatus(user.id);
  const url = new URL(request.url);

  // 접근 가능한 페이지 목록 (체험 기간 종료 시에도 접근 가능)
  const allowedPaths = [
    '/billing',
    '/billing/success',
    '/billing/cancel',
    '/auth/login',
    '/auth/logout',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/api/', // API 경로는 허용
  ];

  // 현재 경로가 허용된 경로인지 확인
  const isAllowedPath = allowedPaths.some(path =>
    url.pathname.startsWith(path)
  );

  // 구독이 필요한 상태이고 허용되지 않은 페이지에 접근하려는 경우
  if (subscriptionStatus.needsPayment && !isAllowedPath) {
    console.log('🚫 구독 필요 - billing 페이지로 리다이렉트', {
      userId: user.id,
      pathname: url.pathname,
      isTrialActive: subscriptionStatus.isTrialActive,
      daysRemaining: subscriptionStatus.daysRemaining,
    });

    // 체험 기간 종료 메시지와 함께 billing 페이지로 리다이렉트
    throw redirect('/billing?reason=trial_expired');
  }

  return { user, subscriptionStatus };
}

/**
 * 구독 상태만 확인하고 리다이렉트하지 않는 헬퍼
 * MainLayout 등에서 사용
 */
export async function getSubscriptionStatusForUser(request: Request) {
  try {
    const { getCurrentUser } = await import('./core.server');
    const user = await getCurrentUser(request);

    if (!user) {
      return null;
    }

    const { getUserSubscriptionStatus } = await import('./subscription');
    const subscriptionStatus = await getUserSubscriptionStatus(user.id);

    return { user, subscriptionStatus };
  } catch (error) {
    console.error('구독 상태 확인 중 오류:', error);
    return null;
  }
}

/**
 * 특정 경로가 구독 없이 접근 가능한지 확인
 */
export function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    '/',
    '/auth/',
    '/billing',
    '/api/',
    '/privacy',
    '/terms',
  ];

  return publicPaths.some(path => pathname.startsWith(path));
}
