import { track } from '@vercel/analytics';

// 페이지 뷰 추적
export function trackPageView(page: string) {
  track('page_view', { page });
  console.log('📊 Page View Tracked:', page);
}

// 버튼 클릭 추적
export function trackButtonClick(button: string, page?: string) {
  track('button_click', { button, ...(page && { page }) });
  console.log('📊 Button Click Tracked:', button, page);
}

// 로그인 추적
export function trackLogin(method: string) {
  track('login', { method });
  console.log('📊 Login Tracked:', method);
}

// 회원가입 추적
export function trackSignup(method: string) {
  track('signup', { method });
  console.log('📊 Signup Tracked:', method);
}

// 초대장 사용 추적
export function trackInvitationUsed(code: string) {
  track('invitation_used', { code });
  console.log('📊 Invitation Used Tracked:', code);
}

// 클라이언트 추가 추적
export function trackClientAdded(agentId: string) {
  track('client_added', { agentId });
  console.log('📊 Client Added Tracked:', agentId);
}

// 파이프라인 상태 변경 추적
export function trackPipelineStageChange(from: string, to: string) {
  track('pipeline_stage_change', { from, to });
  console.log('📊 Pipeline Stage Change Tracked:', from, '→', to);
}

// 오류 추적
export function trackError(error: string, page?: string) {
  track('error', { error, ...(page && { page }) });
  console.log('📊 Error Tracked:', error, page);
}
