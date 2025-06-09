// GA4 측정 ID (환경변수에서 가져옴)
const GA_MEASUREMENT_ID = 'G-SZW1G856L5';

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
  custom_parameters?: Record<string, any>;
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

    // 커스텀 차원 설정
    window.gtag('config', GA_MEASUREMENT_ID, {
      custom_map: {
        custom_dimension_1: 'user_role',
        custom_dimension_2: 'team_size',
        custom_dimension_3: 'insurance_company',
        custom_dimension_4: 'client_count',
        custom_dimension_5: 'pipeline_stage',
      },
    });
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
  custom_parameters,
}: EventProps): void {
  if (
    !GA_MEASUREMENT_ID ||
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function'
  )
    return;

  const eventData: any = {
    event_category: category,
    event_label: label,
    value: value,
    ...custom_parameters,
  };

  window.gtag('event', action, eventData);
  console.log('🎯 이벤트 추적:', {
    action,
    category,
    label,
    value,
    custom_parameters,
  });
}

// 🏢 SureCRM 보험설계사 전용 극한 분석 이벤트들
export const InsuranceAgentEvents = {
  // === 📊 대시보드 & KPI 이벤트 ===
  dashboardView: (kpiData?: any) =>
    trackEvent({
      action: 'view_dashboard',
      category: 'Dashboard',
      label: 'main_dashboard',
      custom_parameters: {
        total_clients: kpiData?.totalClients || 0,
        monthly_new_clients: kpiData?.monthlyNewClients || 0,
        conversion_rate: kpiData?.conversionRate || 0,
        total_premium: kpiData?.totalPremium || 0,
      },
    }),

  kpiGoalSet: (goalType: string, targetValue: number, currentValue: number) =>
    trackEvent({
      action: 'set_kpi_goal',
      category: 'Performance',
      label: goalType,
      value: targetValue,
      custom_parameters: {
        goal_type: goalType,
        target_value: targetValue,
        current_value: currentValue,
        gap_percentage:
          currentValue > 0
            ? ((targetValue - currentValue) / targetValue) * 100
            : 0,
      },
    }),

  // === 👥 고객 관리 (CRM Core) 이벤트 ===
  clientCreate: (clientData?: any) =>
    trackEvent({
      action: 'create_client',
      category: 'Client Management',
      label: 'new_client',
      custom_parameters: {
        importance_level: clientData?.importance,
        has_referrer: !!clientData?.referredBy,
        telecom_provider: clientData?.telecomProvider,
        has_driving_license: clientData?.hasDrivingLicense,
        initial_stage: clientData?.currentStage,
      },
    }),

  clientView: (clientId: string, clientData?: any) =>
    trackEvent({
      action: 'view_client',
      category: 'Client Management',
      label: clientId,
      custom_parameters: {
        importance_level: clientData?.importance,
        current_stage: clientData?.currentStage,
        days_since_created: clientData?.daysSinceCreated,
        meeting_count: clientData?.meetingCount || 0,
        contract_count: clientData?.contractCount || 0,
      },
    }),

  clientEdit: (clientId: string, changeType?: string) =>
    trackEvent({
      action: 'edit_client',
      category: 'Client Management',
      label: clientId,
      custom_parameters: {
        change_type: changeType, // 'basic_info', 'stage_change', 'importance_change', etc.
      },
    }),

  clientStageChange: (
    clientId: string,
    fromStage: string,
    toStage: string,
    daysSinceLastChange?: number
  ) =>
    trackEvent({
      action: 'change_client_stage',
      category: 'Sales Pipeline',
      label: `${fromStage}_to_${toStage}`,
      custom_parameters: {
        client_id: clientId,
        from_stage: fromStage,
        to_stage: toStage,
        days_in_previous_stage: daysSinceLastChange || 0,
        is_progression: getStageOrder(toStage) > getStageOrder(fromStage),
      },
    }),

  clientImportanceChange: (
    clientId: string,
    fromImportance: string,
    toImportance: string
  ) =>
    trackEvent({
      action: 'change_client_importance',
      category: 'Client Management',
      label: `${fromImportance}_to_${toImportance}`,
      custom_parameters: {
        client_id: clientId,
        from_importance: fromImportance,
        to_importance: toImportance,
        is_upgrade:
          getImportanceOrder(toImportance) > getImportanceOrder(fromImportance),
      },
    }),

  // === 🚀 영업 파이프라인 이벤트 ===
  pipelineView: (stageStats?: any) =>
    trackEvent({
      action: 'view_pipeline',
      category: 'Sales Pipeline',
      label: 'pipeline_main',
      custom_parameters: {
        total_opportunities: stageStats?.totalOpportunities || 0,
        total_value: stageStats?.totalValue || 0,
        stages_count: stageStats?.stagesCount || 0,
        conversion_rate: stageStats?.conversionRate || 0,
      },
    }),

  opportunityCreate: (
    insuranceType: string,
    estimatedValue?: number,
    clientImportance?: string
  ) =>
    trackEvent({
      action: 'create_opportunity',
      category: 'Sales Pipeline',
      label: insuranceType,
      value: estimatedValue,
      custom_parameters: {
        insurance_type: insuranceType,
        estimated_value: estimatedValue || 0,
        client_importance: clientImportance,
      },
    }),

  opportunityConvert: (
    insuranceType: string,
    actualValue: number,
    daysSinceCreated?: number
  ) =>
    trackEvent({
      action: 'convert_opportunity',
      category: 'Sales Pipeline',
      label: insuranceType,
      value: actualValue,
      custom_parameters: {
        insurance_type: insuranceType,
        contract_value: actualValue,
        sales_cycle_days: daysSinceCreated || 0,
      },
    }),

  // === 📋 보험 계약 관리 이벤트 ===
  contractCreate: (contractData?: any) =>
    trackEvent({
      action: 'create_contract',
      category: 'Insurance Contract',
      label: contractData?.insuranceType || 'unknown',
      value: contractData?.monthlyPremium || 0,
      custom_parameters: {
        insurance_type: contractData?.insuranceType,
        insurance_company: contractData?.insuranceCompany,
        monthly_premium: contractData?.monthlyPremium || 0,
        expected_commission: contractData?.expectedCommission || 0,
        has_attachments: contractData?.hasAttachments || false,
        contract_status: contractData?.status || 'pending',
      },
    }),

  contractUpdate: (
    contractId: string,
    updateType: string,
    contractData?: any
  ) =>
    trackEvent({
      action: 'update_contract',
      category: 'Insurance Contract',
      label: contractId,
      custom_parameters: {
        update_type: updateType, // 'status_change', 'premium_update', 'attachment_add', etc.
        insurance_type: contractData?.insuranceType,
        new_status: contractData?.status,
        premium_change: contractData?.premiumChange || 0,
      },
    }),

  contractStatusChange: (
    contractId: string,
    fromStatus: string,
    toStatus: string,
    premiumAmount?: number
  ) =>
    trackEvent({
      action: 'change_contract_status',
      category: 'Insurance Contract',
      label: `${fromStatus}_to_${toStatus}`,
      value: premiumAmount,
      custom_parameters: {
        contract_id: contractId,
        from_status: fromStatus,
        to_status: toStatus,
        is_successful: toStatus === 'completed' || toStatus === 'active',
        premium_amount: premiumAmount || 0,
      },
    }),

  attachmentUpload: (
    documentType: string,
    fileSize: number,
    clientImportance?: string
  ) =>
    trackEvent({
      action: 'upload_attachment',
      category: 'Document Management',
      label: documentType,
      value: fileSize,
      custom_parameters: {
        document_type: documentType,
        file_size_kb: Math.round(fileSize / 1024),
        client_importance: clientImportance,
      },
    }),

  // === 🌐 네트워크 & 소개 관리 이벤트 ===
  networkView: (networkStats?: any) =>
    trackEvent({
      action: 'view_network',
      category: 'Network',
      label: 'network_graph',
      custom_parameters: {
        total_connections: networkStats?.totalConnections || 0,
        network_depth: networkStats?.networkDepth || 0,
        top_referrer_count: networkStats?.topReferrerCount || 0,
        referral_conversion_rate: networkStats?.referralConversionRate || 0,
      },
    }),

  referralCreate: (referrerImportance: string, referredImportance: string) =>
    trackEvent({
      action: 'create_referral',
      category: 'Network',
      label: 'new_referral',
      custom_parameters: {
        referrer_importance: referrerImportance,
        referred_importance: referredImportance,
        referral_quality_score: calculateReferralQuality(
          referrerImportance,
          referredImportance
        ),
      },
    }),

  vipClientInteraction: (interactionType: string, clientId: string) =>
    trackEvent({
      action: 'vip_client_interaction',
      category: 'VIP Management',
      label: interactionType, // 'meeting_scheduled', 'gift_sent', 'contract_signed', etc.
      custom_parameters: {
        client_id: clientId,
        interaction_type: interactionType,
      },
    }),

  // === 📅 일정 & 미팅 관리 이벤트 ===
  meetingSchedule: (
    meetingType: string,
    clientImportance?: string,
    isRecurring?: boolean
  ) =>
    trackEvent({
      action: 'schedule_meeting',
      category: 'Calendar',
      label: meetingType,
      custom_parameters: {
        meeting_type: meetingType,
        client_importance: clientImportance,
        is_recurring: isRecurring || false,
        calendar_sync: 'google_calendar',
      },
    }),

  meetingComplete: (
    meetingType: string,
    durationMinutes: number,
    outcome?: string
  ) =>
    trackEvent({
      action: 'complete_meeting',
      category: 'Calendar',
      label: meetingType,
      value: durationMinutes,
      custom_parameters: {
        meeting_type: meetingType,
        duration_minutes: durationMinutes,
        meeting_outcome: outcome, // 'contract_signed', 'follow_up_needed', 'rejected', etc.
      },
    }),

  calendarSync: (syncType: string, eventsCount: number) =>
    trackEvent({
      action: 'calendar_sync',
      category: 'Integration',
      label: syncType, // 'google_calendar', 'outlook', etc.
      value: eventsCount,
      custom_parameters: {
        sync_type: syncType,
        events_synced: eventsCount,
      },
    }),

  // === 👥 팀 관리 이벤트 ===
  teamInvite: (teamSize: number, inviteCode?: string) =>
    trackEvent({
      action: 'invite_team_member',
      category: 'Team Management',
      label: 'team_invite',
      custom_parameters: {
        current_team_size: teamSize,
        invite_code: inviteCode,
      },
    }),

  teamJoin: (teamSize: number, invitedBy?: string) =>
    trackEvent({
      action: 'join_team',
      category: 'Team Management',
      label: 'team_join',
      custom_parameters: {
        new_team_size: teamSize,
        invited_by: invitedBy,
      },
    }),

  teamDataShare: (shareType: string, dataCount: number) =>
    trackEvent({
      action: 'share_team_data',
      category: 'Team Management',
      label: shareType, // 'client_list', 'pipeline_template', 'report', etc.
      value: dataCount,
      custom_parameters: {
        share_type: shareType,
        data_count: dataCount,
      },
    }),

  // === 📊 보고서 & 분석 이벤트 ===
  reportGenerate: (
    reportType: string,
    dataRange: string,
    recordCount?: number
  ) =>
    trackEvent({
      action: 'generate_report',
      category: 'Reports',
      label: reportType,
      value: recordCount,
      custom_parameters: {
        report_type: reportType,
        date_range: dataRange, // 'last_7_days', 'last_30_days', 'last_quarter', etc.
        record_count: recordCount || 0,
      },
    }),

  reportExport: (reportType: string, format: string, recordCount?: number) =>
    trackEvent({
      action: 'export_report',
      category: 'Reports',
      label: `${reportType}_${format}`,
      value: recordCount,
      custom_parameters: {
        report_type: reportType,
        export_format: format, // 'pdf', 'excel', 'csv', etc.
        record_count: recordCount || 0,
      },
    }),

  reportSchedule: (reportType: string, frequency: string) =>
    trackEvent({
      action: 'schedule_report',
      category: 'Reports',
      label: reportType,
      custom_parameters: {
        report_type: reportType,
        schedule_frequency: frequency, // 'daily', 'weekly', 'monthly', etc.
      },
    }),

  // === 🔔 알림 시스템 이벤트 ===
  notificationReceive: (notificationType: string, urgency: string) =>
    trackEvent({
      action: 'receive_notification',
      category: 'Notifications',
      label: notificationType,
      custom_parameters: {
        notification_type: notificationType, // 'birthday_reminder', 'contract_expiry', 'meeting_reminder', etc.
        urgency_level: urgency, // 'low', 'medium', 'high', 'critical'
      },
    }),

  notificationAction: (notificationType: string, action: string) =>
    trackEvent({
      action: 'notification_action',
      category: 'Notifications',
      label: `${notificationType}_${action}`,
      custom_parameters: {
        notification_type: notificationType,
        user_action: action, // 'clicked', 'dismissed', 'snoozed', 'marked_done'
      },
    }),

  // === 🔧 설정 & 개인화 이벤트 ===
  settingsUpdate: (settingType: string, newValue: any, oldValue?: any) =>
    trackEvent({
      action: 'update_settings',
      category: 'Settings',
      label: settingType,
      custom_parameters: {
        setting_type: settingType,
        new_value: String(newValue),
        old_value: oldValue ? String(oldValue) : undefined,
      },
    }),

  themeChange: (newTheme: string, oldTheme?: string) =>
    trackEvent({
      action: 'change_theme',
      category: 'Personalization',
      label: newTheme,
      custom_parameters: {
        new_theme: newTheme,
        old_theme: oldTheme,
      },
    }),

  // === 🔐 인증 & 보안 이벤트 ===
  userLogin: (loginMethod?: string, loginDuration?: number) =>
    trackEvent({
      action: 'login',
      category: 'Authentication',
      label: 'user_login',
      custom_parameters: {
        login_method: loginMethod || 'magic_link',
        session_duration_minutes: loginDuration,
      },
    }),

  userSignup: (invitationCode?: string, referredBy?: string) =>
    trackEvent({
      action: 'signup',
      category: 'Authentication',
      label: 'user_signup',
      custom_parameters: {
        invitation_code: invitationCode,
        referred_by: referredBy,
        signup_method: 'invitation_only',
      },
    }),

  userLogout: (sessionDuration?: number) =>
    trackEvent({
      action: 'logout',
      category: 'Authentication',
      label: 'user_logout',
      custom_parameters: {
        session_duration_minutes: sessionDuration,
      },
    }),

  sensitiveDataAccess: (dataType: string, accessType: string) =>
    trackEvent({
      action: 'access_sensitive_data',
      category: 'Security',
      label: `${dataType}_${accessType}`,
      custom_parameters: {
        data_type: dataType, // 'ssn', 'bank_account', 'personal_info', etc.
        access_type: accessType, // 'view', 'edit', 'export', 'decrypt'
      },
    }),

  // === 💡 사용성 & 기능 활용 이벤트 ===
  featureDiscovery: (featureName: string, discoveryMethod: string) =>
    trackEvent({
      action: 'discover_feature',
      category: 'Feature Usage',
      label: featureName,
      custom_parameters: {
        feature_name: featureName,
        discovery_method: discoveryMethod, // 'menu_click', 'search', 'onboarding', 'tooltip', etc.
      },
    }),

  helpDocumentView: (documentType: string, searchQuery?: string) =>
    trackEvent({
      action: 'view_help',
      category: 'User Support',
      label: documentType,
      custom_parameters: {
        document_type: documentType,
        search_query: searchQuery,
      },
    }),

  errorEncounter: (
    errorType: string,
    errorCode?: string,
    userAction?: string
  ) =>
    trackEvent({
      action: 'encounter_error',
      category: 'Error Tracking',
      label: errorType,
      custom_parameters: {
        error_type: errorType,
        error_code: errorCode,
        user_action_when_error: userAction,
      },
    }),

  // === 🎯 성과 & 목표 이벤트 ===
  goalAchievement: (
    goalType: string,
    achievementRate: number,
    timeToAchieve?: number
  ) =>
    trackEvent({
      action: 'achieve_goal',
      category: 'Performance',
      label: goalType,
      value: achievementRate,
      custom_parameters: {
        goal_type: goalType,
        achievement_rate: achievementRate,
        days_to_achieve: timeToAchieve,
        is_exceeded: achievementRate > 100,
      },
    }),

  milestoneReach: (milestoneType: string, value: number) =>
    trackEvent({
      action: 'reach_milestone',
      category: 'Performance',
      label: milestoneType,
      value: value,
      custom_parameters: {
        milestone_type: milestoneType, // 'first_contract', '10_clients', '1M_premium', etc.
        milestone_value: value,
      },
    }),
};

// 헬퍼 함수들
function getStageOrder(stageName: string): number {
  const stageOrder: Record<string, number> = {
    잠재고객: 1,
    접촉완료: 2,
    니즈분석: 3,
    제안중: 4,
    계약검토: 5,
    계약체결: 6,
    완료: 7,
  };
  return stageOrder[stageName] || 0;
}

function getImportanceOrder(importance: string): number {
  const importanceOrder: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
  };
  return importanceOrder[importance] || 0;
}

function calculateReferralQuality(
  referrerImportance: string,
  referredImportance: string
): number {
  const referrerScore = getImportanceOrder(referrerImportance);
  const referredScore = getImportanceOrder(referredImportance);
  return (referrerScore + referredScore) / 2;
}

// GA 활성화 상태 확인
export function isGAEnabled(): boolean {
  return (
    !!GA_MEASUREMENT_ID &&
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function'
  );
}

// 세션 트래킹을 위한 유틸리티
export const SessionTracking = {
  startSession: () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('ga_session_start', Date.now().toString());
    }
  },

  endSession: () => {
    if (typeof window !== 'undefined') {
      const startTime = window.sessionStorage.getItem('ga_session_start');
      if (startTime) {
        const duration = Date.now() - parseInt(startTime);
        InsuranceAgentEvents.userLogout(Math.round(duration / 60000)); // 분 단위
        window.sessionStorage.removeItem('ga_session_start');
      }
    }
  },

  getSessionDuration: (): number => {
    if (typeof window !== 'undefined') {
      const startTime = window.sessionStorage.getItem('ga_session_start');
      if (startTime) {
        return Math.round((Date.now() - parseInt(startTime)) / 60000); // 분 단위
      }
    }
    return 0;
  },
};

// 기존 CRMEvents는 InsuranceAgentEvents로 대체됨
export const CRMEvents = InsuranceAgentEvents;
