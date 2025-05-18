import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  // 랜딩 페이지
  index('common/pages/landing-page.tsx'),

  // 대시보드
  route('dashboard', 'common/pages/dashboard-page.tsx'),

  // 인증 관련 페이지
  route('login', 'common/pages/auth/login-page.tsx'),
  route('invite-only', 'common/pages/auth/invite-only-page.tsx'),
  route('invite/:code', 'common/pages/auth/invite-page.tsx'),
  route('recover', 'common/pages/auth/recover-page.tsx'),

  // 초기 설정
  route('onboarding', 'features/onboarding/onboarding-page.tsx'),

  // 주요 기능 페이지
  route('network', 'features/network/network-page.tsx'),
  route('pipeline', 'features/pipeline/pipeline-page.tsx'),

  // 고객 관리
  route('clients', 'features/clients/clients-page.tsx'),
  route('clients/:id', 'features/clients/client-detail-page.tsx'),
  route('clients/edit/:id?', 'features/clients/client-edit-page.tsx'),

  // 일정 관리
  route('calendar', 'features/calendar/calendar-page.tsx'),

  // 소개자 및 데이터 관리
  route('influencers', 'features/influencers/influencers-page.tsx'),
  route('import', 'features/import/import-page.tsx'),

  // 초대 및 팀 관리
  route('invitations', 'features/invitations/invitations-page.tsx'),
  route('team', 'features/team/team-page.tsx'),
  route('team/join/:code', 'features/team/team-join-page.tsx'),

  // 보고서 및 설정
  route('reports', 'features/reports/reports-page.tsx'),
  route('settings', 'features/settings/settings-page.tsx'),

  // 기타 페이지
  route('404', 'common/pages/error/not-found-page.tsx'),
  route('terms', 'common/pages/terms-page.tsx'),
] satisfies RouteConfig;
