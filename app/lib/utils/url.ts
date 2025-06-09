/**
 * Get the base URL for the application
 * Works in both client and server environments
 */
export function getBaseUrl(): string {
  // 클라이언트 사이드에서는 현재 도메인 사용
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // 서버 사이드에서는 환경 변수 사용
  return process.env.SITE_URL || 'https://surecrm-sigma.vercel.app';
}

/**
 * Generate an invitation link with the current base URL
 */
export function getInvitationLink(code: string): string {
  return `${getBaseUrl()}/invite/${code}`;
}
