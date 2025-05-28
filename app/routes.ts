import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  // 랜딩 페이지
  index('common/pages/landing-page.tsx'),

  // API 라우트
  route('api/notifications', 'routes/api+/notifications.tsx'),
  route('api/validate-invitation', 'routes/api+/validate-invitation.ts'),

  // 대시보드
  route('dashboard', 'features/dashboard/pages/dashboard-page.tsx'),

  // 인증 관련 페이지
  route('auth/login', 'common/pages/auth/login-page.tsx'),
  route('auth/signup', 'common/pages/auth/signup-page.tsx'),
  route('auth/logout', 'routes/auth.logout.tsx'),
  route('auth/forgot-password', 'common/pages/auth/forgot-password-page.tsx'),
  route('invite-only', 'common/pages/auth/invite-only-page.tsx'),
  route('auth/recover', 'common/pages/auth/recover-page.tsx'),

  // 주요 기능 페이지
  route('network', 'features/network/pages/network-page.tsx'),
  route('pipeline', 'features/pipeline/pages/pipeline-page.tsx'),

  // 고객 관리
  route('clients', 'features/clients/pages/clients-page.tsx'),
  route('clients/:id', 'features/clients/pages/client-detail-page.tsx'),
  route('clients/edit/:id?', 'features/clients/pages/client-edit-page.tsx'),

  // 일정 관리
  route('calendar', 'features/calendar/pages/calendar-page.tsx'),

  // 소개자 관리
  route('influencers', 'features/influencers/pages/influencers-page.tsx'),

  // 초대 및 팀 관리
  route('invitations', 'features/invitations/pages/invitations-page.tsx'),
  route('my-invitations', 'features/invitations/pages/my-invitations-page.tsx'),
  route('team', 'features/team/pages/team-page.tsx'),
  route('team/join/:code', 'features/team/pages/team-join-page.tsx'),

  // 보고서 및 설정
  route('reports', 'features/reports/pages/reports-page.tsx'),
  route('settings', 'features/settings/pages/settings-page.tsx'),
  route('notifications', 'features/notifications/pages/notifications-page.tsx'),

  // .well-known 경로 처리 (Chrome DevTools 등)
  route('.well-known/*', 'common/pages/well-known-fallback.tsx'),

  // 기타 페이지
  route('terms', 'common/pages/terms-page.tsx'),

  // Catch-all 라우트 (모든 일치하지 않는 경로를 처리)
  route('*', 'common/pages/error/not-found-page.tsx'),
] satisfies RouteConfig;
