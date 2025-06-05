import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  // 🏠 메인 페이지 (인증 상태에 따른 리다이렉트)
  index('common/pages/_index.tsx'),

  // 🔌 API 라우트
  route('api/notifications', 'api/notifications.ts'),
  route('api/validate-invitation', 'api/validate-invitation.ts'),
  route('api/resend-verification', 'api/resend-verification.ts'),
  route('api/auth-webhook', 'api/auth-webhook.ts'),
  route('api/auth-me', 'api/auth-me.ts'),
  route('api/cleanup-user', 'api/cleanup-user.ts'),
  route('api/check-email', 'api/check-email.ts'),
  route('api/seed-invitations', 'api/seed-invitations.ts'),
  route('api/user.settings', 'api/user.settings.ts'),

  // 🏷️ 태그 관련 API 라우트
  route('api/clients/tags', 'api/clients/tags/route.ts'),
  route('api/clients/client-tags', 'api/clients/client-tags.ts'),

  // 📊 대시보드
  route('dashboard', 'features/dashboard/pages/dashboard-page.tsx'),

  // 🔐 인증 관련 페이지
  route('auth/login', 'common/pages/auth/login-page.tsx'),
  route('auth/signup', 'common/pages/auth/signup-page.tsx'),
  route('auth/logout', 'common/pages/auth/auth.logout.tsx'),
  route('auth/forgot-password', 'common/pages/auth/forgot-password-page.tsx'),
  route('auth/otp-verification', 'common/pages/auth/otp-verification-page.tsx'),
  route('auth/magic-link-verify', 'common/pages/auth/magic-link-verify.tsx'),
  route(
    'auth/email-verification',
    'common/pages/auth/email-verification-page.tsx'
  ),
  route('auth/email-confirmed', 'common/pages/auth/email-confirmed-page.tsx'),
  route('invite-only', 'common/pages/auth/invite-only-page.tsx'),
  route('auth/recover', 'common/pages/auth/recover-page.tsx'),

  // 🌐 네트워크 & 파이프라인
  route('network', 'features/network/pages/network-page.tsx'),
  route('pipeline', 'features/pipeline/pages/pipeline-page.tsx'),

  // 👥 고객 관리
  route('clients', 'features/clients/pages/clients-page.tsx'),
  route('clients/:id', 'features/clients/pages/client-detail-page.tsx'),
  route('clients/edit/:id?', 'features/clients/pages/client-edit-page.tsx'),

  // 📅 일정 관리
  // route('calendar', 'features/calendar/pages/calendar-page.tsx'),
  route('calendar', 'common/pages/calendar-redirect.tsx'),

  // ⭐ 소개자 관리
  // route('influencers', 'features/influencers/pages/influencers-page.tsx'),
  route('influencers', 'common/pages/influencers-redirect.tsx'),

  // 🎫 초대 및 팀 관리
  route('invitations', 'features/invitations/pages/invitations-page.tsx'),
  route('team', 'features/team/pages/team-page.tsx'),
  route('team/join/:code', 'features/team/pages/team-join-page.tsx'),

  // 📈 보고서 & 설정
  route('reports', 'features/reports/pages/reports-page.tsx'),
  route('settings', 'features/settings/pages/settings-page.tsx'),
  route('notifications', 'features/notifications/pages/notifications-page.tsx'),

  // 🔑 관리자 기능
  route('system-console', 'features/admin/pages/admin-dashboard-page.tsx'),
  route(
    'system-console/invitations-mgmt',
    'features/admin/pages/admin-invitations-page.tsx'
  ),
  route(
    'system-console/users-mgmt',
    'features/admin/pages/admin-users-page.tsx'
  ),
  route(
    'system-console/audit-logs',
    'features/admin/pages/admin-audit-logs-page.tsx'
  ),
  route(
    'system-console/settings',
    'features/admin/pages/admin-settings-page.tsx'
  ),

  // 🔧 시스템 페이지
  route('.well-known/*', 'common/pages/well-known-fallback.tsx'),
  route('terms', 'common/pages/terms-page.tsx'),

  // 🚫 Catch-all (404 처리)
  route('*', 'common/pages/error/not-found-page.tsx'),
] satisfies RouteConfig;
