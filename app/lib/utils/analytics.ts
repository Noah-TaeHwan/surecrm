// GA4 측정 ID (환경변수에서 가져옴)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// gtag 함수 타입 정의
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: any
    ) => void;
    dataLayer: any[];
  }
}

interface PageViewProps {
  path: string;
  title?: string;
}

interface EventProps {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// GA 초기화 확인
export function initGA(): void {
  if (!GA_MEASUREMENT_ID) {
    console.warn('⚠️ Google Analytics 측정 ID가 설정되지 않았습니다.');
    return;
  }

  // gtag가 로드되었는지 확인
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    console.log('✅ Google Analytics 초기화 완료:', GA_MEASUREMENT_ID);
  } else {
    console.warn('⚠️ gtag가 아직 로드되지 않았습니다.');
  }
}

// 페이지 뷰 추적
export function trackPageView({ path, title }: PageViewProps): void {
  if (
    !GA_MEASUREMENT_ID ||
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function'
  )
    return;

  window.gtag('event', 'page_view', {
    page_title: title || document.title,
    page_location: window.location.href,
    page_path: path,
  });

  console.log('📊 페이지 뷰 추적:', path);
}

// 커스텀 이벤트 추적
export function trackEvent({
  action,
  category,
  label,
  value,
}: EventProps): void {
  if (
    !GA_MEASUREMENT_ID ||
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function'
  )
    return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });

  console.log('🎯 이벤트 추적:', { action, category, label, value });
}

// SureCRM 특화 이벤트들
export const CRMEvents = {
  // 대시보드 이벤트
  dashboardView: () =>
    trackEvent({
      action: 'view_dashboard',
      category: 'Dashboard',
      label: 'main_dashboard',
    }),

  // 고객 관리 이벤트
  clientCreate: () =>
    trackEvent({
      action: 'create_client',
      category: 'Client Management',
      label: 'new_client',
    }),

  clientView: (clientId: string) =>
    trackEvent({
      action: 'view_client',
      category: 'Client Management',
      label: clientId,
    }),

  clientEdit: (clientId: string) =>
    trackEvent({
      action: 'edit_client',
      category: 'Client Management',
      label: clientId,
    }),

  clientDelete: () =>
    trackEvent({
      action: 'delete_client',
      category: 'Client Management',
      label: 'client_deleted',
    }),

  // 파이프라인 이벤트
  pipelineView: () =>
    trackEvent({
      action: 'view_pipeline',
      category: 'Sales Pipeline',
      label: 'pipeline_main',
    }),

  stageChange: (fromStage: string, toStage: string) =>
    trackEvent({
      action: 'change_stage',
      category: 'Sales Pipeline',
      label: `${fromStage}_to_${toStage}`,
    }),

  // 보험 계약 이벤트
  contractCreate: () =>
    trackEvent({
      action: 'create_contract',
      category: 'Insurance Contract',
      label: 'new_contract',
    }),

  contractUpdate: (contractId: string) =>
    trackEvent({
      action: 'update_contract',
      category: 'Insurance Contract',
      label: contractId,
    }),

  // 네트워크 이벤트
  networkView: () =>
    trackEvent({
      action: 'view_network',
      category: 'Network',
      label: 'network_graph',
    }),

  // 보고서 이벤트
  reportGenerate: (reportType: string) =>
    trackEvent({
      action: 'generate_report',
      category: 'Reports',
      label: reportType,
    }),

  reportExport: (reportType: string, format: string) =>
    trackEvent({
      action: 'export_report',
      category: 'Reports',
      label: `${reportType}_${format}`,
    }),

  // 인증 이벤트
  userLogin: () =>
    trackEvent({
      action: 'login',
      category: 'Authentication',
      label: 'user_login',
    }),

  userSignup: () =>
    trackEvent({
      action: 'signup',
      category: 'Authentication',
      label: 'user_signup',
    }),

  userLogout: () =>
    trackEvent({
      action: 'logout',
      category: 'Authentication',
      label: 'user_logout',
    }),

  // 설정 이벤트
  settingsUpdate: (settingType: string) =>
    trackEvent({
      action: 'update_settings',
      category: 'Settings',
      label: settingType,
    }),

  // 팀 관리 이벤트
  teamInvite: () =>
    trackEvent({
      action: 'invite_team_member',
      category: 'Team Management',
      label: 'team_invite',
    }),

  teamJoin: () =>
    trackEvent({
      action: 'join_team',
      category: 'Team Management',
      label: 'team_join',
    }),
};

// GA 활성화 상태 확인
export function isGAEnabled(): boolean {
  return (
    !!GA_MEASUREMENT_ID &&
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function'
  );
}
