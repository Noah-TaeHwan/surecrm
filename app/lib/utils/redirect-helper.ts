import { redirect } from 'react-router';

/**
 * SEO 친화적인 리디렉션 헬퍼 함수들
 */

/**
 * 영구 리디렉션 (301) - SEO에서 선호
 * 페이지가 영구적으로 이동했을 때 사용
 */
export function permanentRedirect(url: string, init?: ResponseInit) {
  return redirect(url, {
    status: 301,
    ...init,
  });
}

/**
 * 임시 리디렉션 (302) - 기본값
 * 임시적인 이동이나 조건부 리디렉션에 사용
 */
export function temporaryRedirect(url: string, init?: ResponseInit) {
  return redirect(url, {
    status: 302,
    ...init,
  });
}

/**
 * See Other 리디렉션 (303)
 * POST 요청 후 GET 페이지로 리디렉션할 때 사용
 */
export function seeOtherRedirect(url: string, init?: ResponseInit) {
  return redirect(url, {
    status: 303,
    ...init,
  });
}

/**
 * 인증 관련 리디렉션 - 로그인 상태에 따라 적절한 처리
 */
export function authRedirect(url: string, reason?: string) {
  const redirectUrl = reason ? `${url}?reason=${reason}` : url;
  return temporaryRedirect(redirectUrl);
}

/**
 * 역할 기반 리디렉션 - 사용자 역할에 따른 적절한 페이지로 이동
 */
export function roleBasedRedirect(
  userRole: string,
  fallbackUrl = '/dashboard'
) {
  const roleRoutes = {
    system_admin: '/system-console',
    team_leader: '/team',
    agent: '/dashboard',
  };

  const targetUrl =
    roleRoutes[userRole as keyof typeof roleRoutes] || fallbackUrl;
  return temporaryRedirect(targetUrl);
}

/**
 * 조건부 리디렉션 - 특정 조건에 따른 리디렉션
 */
export function conditionalRedirect(
  condition: boolean,
  targetUrl: string,
  fallbackUrl?: string
) {
  if (condition) {
    return temporaryRedirect(targetUrl);
  }
  if (fallbackUrl) {
    return temporaryRedirect(fallbackUrl);
  }
  return null;
}

/**
 * 언어별 리디렉션 - 다국어 지원
 */
export function languageRedirect(
  acceptLanguage: string,
  currentPath: string,
  baseUrl: string
) {
  const preferredLang = acceptLanguage.includes('ja')
    ? 'ja'
    : acceptLanguage.includes('en')
      ? 'en'
      : 'ko';

  if (preferredLang !== 'ko' && !currentPath.startsWith(`/${preferredLang}`)) {
    const newPath = `/${preferredLang}${currentPath}`;
    return temporaryRedirect(`${baseUrl}${newPath}`);
  }

  return null;
}

/**
 * 구독 상태 기반 리디렉션
 */
export function subscriptionRedirect(
  needsPayment: boolean,
  currentPath: string
) {
  const allowedPaths = [
    '/billing',
    '/billing/success',
    '/billing/cancel',
    '/auth/login',
    '/auth/logout',
    '/auth/signup',
  ];

  if (
    needsPayment &&
    !allowedPaths.some(path => currentPath.startsWith(path))
  ) {
    return temporaryRedirect('/billing?reason=subscription_required');
  }

  return null;
}

/**
 * URL 정규화 - trailing slash, 대소문자 등 처리
 */
export function normalizeUrl(
  url: string,
  options: {
    removeTrailingSlash?: boolean;
    toLowerCase?: boolean;
  } = {}
) {
  let normalizedUrl = url;

  if (options.toLowerCase) {
    normalizedUrl = normalizedUrl.toLowerCase();
  }

  if (
    options.removeTrailingSlash &&
    normalizedUrl.endsWith('/') &&
    normalizedUrl !== '/'
  ) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }

  return normalizedUrl;
}

/**
 * 리디렉션 루프 방지 헬퍼
 */
export function safeRedirect(
  targetUrl: string,
  currentUrl: string,
  maxRedirects = 3
): Response | null {
  // 같은 URL로의 리디렉션 방지
  if (targetUrl === currentUrl) {
    console.warn(`리디렉션 루프 방지: ${currentUrl} -> ${targetUrl}`);
    return null;
  }

  // URL 정규화 후 비교
  const normalizedTarget = normalizeUrl(targetUrl, {
    removeTrailingSlash: true,
    toLowerCase: true,
  });
  const normalizedCurrent = normalizeUrl(currentUrl, {
    removeTrailingSlash: true,
    toLowerCase: true,
  });

  if (normalizedTarget === normalizedCurrent) {
    console.warn(`정규화 후 리디렉션 루프 방지: ${currentUrl} -> ${targetUrl}`);
    return null;
  }

  return temporaryRedirect(targetUrl);
}
