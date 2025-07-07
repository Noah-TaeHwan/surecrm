import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  // 🏠 메인 페이지 (랜딩페이지)
  index('common/pages/landing-page.tsx'),

  // 📊 대시보드
  route('dashboard', 'features/dashboard/pages/dashboard-page.tsx'),

  // 🎉 웰컴
  route('welcome', 'common/pages/welcome-page.tsx'),

  // 🔐 인증 관련 페이지
  route('auth/login', 'common/pages/auth/login-page.tsx'),
  route('auth/signup', 'common/pages/auth/signup-page.tsx'),
  route('auth/logout', 'common/pages/auth/auth.logout.tsx'),
  route('auth/forgot-password', 'common/pages/auth/forgot-password-page.tsx'),
  route('auth/confirm', 'routes/auth.confirm.tsx'),
  route('auth/new-password', 'routes/auth.new-password.tsx'),
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
  route('clients/:clientId', 'routes/clients.$clientId.tsx'),
  route('clients/:clientId/edit', 'routes/clients.$clientId.edit.tsx'),

  // 📅 일정 관리
  route('calendar', 'routes/calendar.tsx'),

  // ⭐ 소개자 관리
  route('influencers', 'common/pages/influencers-redirect.tsx'),

  // 🎫 초대 및 팀 관리
  route('invitations', 'features/invitations/pages/invitations-page.tsx'),
  route('team', 'features/team/pages/team-page.tsx'),
  route('team/join/:code', 'features/team/pages/team-join-page.tsx'),

  // 📈 보고서 & 설정
  route('reports', 'features/reports/pages/reports-page.tsx'),
  route('billing', 'routes/billing.tsx'),
  route('billing/success', 'routes/billing.success.tsx'),
  route('billing/subscribe', 'routes/billing.subscribe.tsx'),
  route('settings', 'features/settings/pages/settings-page.tsx'),
  route('notifications', 'features/notifications/pages/notifications-page.tsx'),

  // 🔑 관리자 기능
  // 💬 NOTE: 옛날 어드민 라우트는 삭제합니다. 새로운 /admin 라우트를 사용합니다.
  // route('system-console', 'features/admin/pages/admin-dashboard-page.tsx'),
  // route(
  //   'system-console/invitations-mgmt',
  //   'features/admin/pages/admin-invitations-page.tsx'
  // ),
  // route(
  //   'system-console/audit-logs',
  //   'features/admin/pages/admin-audit-logs-page.tsx'
  // ),
  // route(
  //   'system-console/settings',
  //   'features/admin/pages/admin-settings-page.tsx'
  // ),
  // route(
  //   'system-console/users-mgmt',
  //   'features/admin/pages/admin-users-page.tsx'
  // ),

  // 🔑 새로운 관리자 기능
  route('admin', 'routes/admin.tsx', [
    index('routes/admin/index.tsx'),
    route('users', 'routes/admin/users.tsx'),
    route('posts', 'routes/admin/posts.tsx', [
      index('routes/admin/posts/index.tsx'),
      route('new', 'routes/admin/posts/new.tsx'),
      route(':postId/edit', 'routes/admin/posts/$postId.edit.tsx'),
    ]),
  ]),

  // 🔧 시스템 페이지
  route('.well-known/*', 'common/pages/well-known-fallback.tsx'),
  route('terms', 'common/pages/terms-page.tsx'),
  route('privacy', 'common/pages/privacy-page.tsx'),

  // 📧 이메일 테스트 페이지
  route('email-test', 'routes/email-test.tsx'),

  // 🌍 다국어 테스트 페이지
  route('test-i18n', 'routes/test-i18n.tsx'),

  // 🔍 SEO 관련 라우트
  route('sitemap.xml', 'routes/sitemap[.]xml.ts'),

  // 🛠️ API 라우트들
  route('api/auth/me', 'routes/api.auth.me.ts'),
  route(
    'api/auth/subscription-status',
    'routes/api.auth.subscription-status.ts'
  ),
  route('api/auth/set-session', 'routes/api.auth.set-session.ts'),
  route('api/auth/new-password', 'routes/api.auth.new-password.ts'),
  route('api/auth/profile-debug', 'routes/api.auth.profile-debug.ts'),
  route('api/email/send-test', 'routes/api.email.send-test.ts'),
  route('api/email/welcome-preview', 'routes/api.email.welcome-preview.ts'),
  route('api/contact', 'routes/api.contact.ts'),
  route('api/feedback/send', 'routes/api.feedback.send.ts'),
  route('api/notifications', 'routes/api.notifications.ts'),
  route('api/auth/check-email', 'routes/api.auth.check-email.ts'),
  route(
    'api/auth/validate-invitation',
    'routes/api.auth.validate-invitation.ts'
  ),
  route('api/auth/webhook', 'routes/api.auth.webhook.ts'),
  route(
    'api/auth/resend-verification',
    'routes/api.auth.resend-verification.ts'
  ),
  route('api/user/settings', 'routes/api.user.settings.ts'),
  route('api/admin/cleanup-user', 'routes/api.admin.cleanup-user.ts'),
  route('api/admin/seed-invitations', 'routes/api.admin.seed-invitations.ts'),
  route('api/billing/checkout', 'routes/api.billing.checkout.ts'),
  route('api/billing/webhook', 'routes/api.billing.webhook.ts'),
  route('api/clients/delete', 'routes/api.clients.delete.ts'),
  route('api/clients/tags', 'routes/api.clients.tags.ts'),
  route('api/clients/client-tags', 'routes/api.clients.client-tags.ts'),
  route('api/clients/stage', 'routes/api.clients.stage.ts'),
  route('api/clients/update', 'routes/api.clients.update.ts'),
  route('api/clients/detail', 'routes/api.clients.detail.ts'),
  route('api/clients/:clientId', 'routes/api.clients.clientId.ts'),
  route('api/pipeline/stages', 'routes/api.pipeline.stages.ts'),
  route('api/insurance-contracts', 'routes/api.insurance-contracts.ts'),
  route(
    'api/update-insurance-contract',
    'routes/api.update-insurance-contract.ts'
  ),

  // 📥 첨부파일 다운로드 API
  route('api/download-attachment', 'routes/api.download-attachment.ts'),

  // 📅 구글 캘린더 연동 API
  route(
    'api/google/calendar/callback',
    'routes/api.google.calendar.callback.ts'
  ),
  route('api/google/calendar/sync', 'routes/api.google.calendar.sync.ts'),

  // 📄 랜딩페이지 관련 정적 페이지들
  route('contact', 'common/pages/contact-page.tsx'),
  route('features', 'common/pages/features-page.tsx'),
  route('help', 'common/pages/help-page.tsx'),
  route('pricing', 'common/pages/pricing-page.tsx'),

  // 🚫 Catch-all (404 처리) - API 라우트 이후에 배치
  route('*', 'common/pages/error/not-found-page.tsx'),
] satisfies RouteConfig;
