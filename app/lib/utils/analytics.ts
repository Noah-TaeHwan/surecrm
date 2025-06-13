import {
  shouldCollectAnalytics,
  logAnalyticsStatus,
  analyticsConfig,
  analytics_log,
} from './analytics-config';

// GA4 측정 ID (환경변수에서 안전하게 가져옴)
const GA_MEASUREMENT_ID = analyticsConfig.GA_MEASUREMENT_ID;

// gtag 함수 및 로그 플래그 타입 정의
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: any
    ) => void;
    dataLayer: any[];
    // 로그 중복 방지 플래그들
    __gtm_dev_logged?: boolean;
    __gtm_success_logged?: boolean;
    __ga_dev_logged?: boolean;
    __ga_success_logged?: boolean;
    __analytics_dev_logged?: boolean;
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
    analytics_log.warn('Google Analytics 측정 ID가 설정되지 않았습니다.');
    return;
  }

  // gtag가 로드되었는지 확인
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    analytics_log.info(`Google Analytics 초기화 완료: ${GA_MEASUREMENT_ID}`);

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
    analytics_log.debug('gtag가 아직 로드되지 않았습니다.');
  }
}

// 페이지 뷰 추적
export function trackPageView({ path, title }: PageViewProps): void {
  // 🔒 통합 분석 환경 설정 확인
  if (!shouldCollectAnalytics()) {
    // DEBUG 레벨에서만 로그 출력 (너무 많은 로그 방지)
    logAnalyticsStatus('페이지 뷰 추적', 4); // DEBUG level
    return;
  }

  if (
    !GA_MEASUREMENT_ID ||
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function'
  ) {
    return;
  }

  window.gtag('event', 'page_view', {
    page_title: title || document.title,
    page_location: window.location.href,
    page_path: path,
  });

  // DEBUG 레벨에서만 성공 로그 출력
  logAnalyticsStatus('페이지 뷰 추적', 4); // DEBUG level
}

// 커스텀 이벤트 추적
export function trackEvent({
  action,
  category,
  label,
  value,
  custom_parameters,
}: EventProps): void {
  // 🔒 통합 분석 환경 설정 확인
  if (!shouldCollectAnalytics()) {
    // DEBUG 레벨에서만 로그 출력
    logAnalyticsStatus(`이벤트 추적: ${action}`, 4); // DEBUG level
    return;
  }

  if (
    !GA_MEASUREMENT_ID ||
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function'
  ) {
    return;
  }

  const eventData: any = {
    event_category: category,
    event_label: label,
    value: value,
    ...custom_parameters,
  };

  window.gtag('event', action, eventData);

  // INFO 레벨에서 중요한 이벤트만 로그 출력
  const importantEvents = [
    'create_client',
    'dashboard_view',
    'contract_signed',
  ];
  const logLevel = importantEvents.includes(action) ? 3 : 4; // INFO : DEBUG
  logAnalyticsStatus(`이벤트 추적: ${action}`, logLevel);
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

  kpiGoalDelete: (goalId: string) =>
    trackEvent({
      action: 'delete_kpi_goal',
      category: 'Performance',
      label: goalId,
      custom_parameters: {
        goal_id: goalId,
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

  // === 📊 대시보드 인터랙션 이벤트 ===
  dashboardCardClick: (cardType: string, cardData?: any) =>
    trackEvent({
      action: 'click_dashboard_card',
      category: 'Dashboard',
      label: cardType,
      custom_parameters: {
        card_type: cardType,
        card_value: cardData?.value,
        timestamp: Date.now(),
      },
    }),

  dashboardRefresh: () =>
    trackEvent({
      action: 'refresh_dashboard',
      category: 'Dashboard',
      label: 'manual_refresh',
      custom_parameters: {
        refresh_time: new Date().toISOString(),
      },
    }),

  dashboardSearch: (searchTerm: string, resultsCount?: number) =>
    trackEvent({
      action: 'search_dashboard',
      category: 'Dashboard',
      label: searchTerm,
      custom_parameters: {
        search_term: searchTerm,
        results_count: resultsCount || 0,
        search_length: searchTerm.length,
      },
    }),

  // === 🎯 파이프라인 상세 이벤트 ===
  pipelineStageClick: (stageName: string, clientCount: number) =>
    trackEvent({
      action: 'click_pipeline_stage',
      category: 'Sales Pipeline',
      label: stageName,
      custom_parameters: {
        stage_name: stageName,
        client_count: clientCount,
      },
    }),

  pipelineCardExpand: (stageName: string) =>
    trackEvent({
      action: 'expand_pipeline_card',
      category: 'Sales Pipeline',
      label: stageName,
      custom_parameters: {
        stage_name: stageName,
      },
    }),

  // === 📋 고객 리스트 이벤트 ===
  clientListView: (filterType?: string, sortType?: string) =>
    trackEvent({
      action: 'view_client_list',
      category: 'Client Management',
      label: 'client_list',
      custom_parameters: {
        filter_type: filterType,
        sort_type: sortType,
      },
    }),

  clientListFilter: (filterType: string, filterValue: string) =>
    trackEvent({
      action: 'filter_client_list',
      category: 'Client Management',
      label: filterType,
      custom_parameters: {
        filter_type: filterType,
        filter_value: filterValue,
      },
    }),

  clientListSort: (sortField: string, sortDirection: string) =>
    trackEvent({
      action: 'sort_client_list',
      category: 'Client Management',
      label: sortField,
      custom_parameters: {
        sort_field: sortField,
        sort_direction: sortDirection,
      },
    }),

  clientCardClick: (clientId: string, cardPosition: number) =>
    trackEvent({
      action: 'click_client_card',
      category: 'Client Management',
      label: clientId,
      custom_parameters: {
        client_id: clientId,
        card_position: cardPosition,
      },
    }),

  // === 📱 UI/UX 인터랙션 이벤트 ===
  navigationClick: (menuItem: string, currentPage: string) =>
    trackEvent({
      action: 'navigate',
      category: 'Navigation',
      label: menuItem,
      custom_parameters: {
        menu_item: menuItem,
        from_page: currentPage,
      },
    }),

  modalOpen: (modalType: string, context?: string) =>
    trackEvent({
      action: 'open_modal',
      category: 'UI Interaction',
      label: modalType,
      custom_parameters: {
        modal_type: modalType,
        context: context,
      },
    }),

  modalClose: (modalType: string, closeMethod: string) =>
    trackEvent({
      action: 'close_modal',
      category: 'UI Interaction',
      label: modalType,
      custom_parameters: {
        modal_type: modalType,
        close_method: closeMethod, // 'button', 'escape', 'overlay'
      },
    }),

  buttonClick: (buttonText: string, buttonType: string, pageContext: string) =>
    trackEvent({
      action: 'click_button',
      category: 'UI Interaction',
      label: buttonText,
      custom_parameters: {
        button_text: buttonText,
        button_type: buttonType,
        page_context: pageContext,
      },
    }),

  tooltipHover: (tooltipContent: string, elementType: string) =>
    trackEvent({
      action: 'hover_tooltip',
      category: 'UI Interaction',
      label: tooltipContent,
      custom_parameters: {
        tooltip_content: tooltipContent,
        element_type: elementType,
      },
    }),

  // === 📊 보고서 상세 이벤트 ===
  reportFilterChange: (filterType: string, filterValue: string) =>
    trackEvent({
      action: 'change_report_filter',
      category: 'Reports',
      label: filterType,
      custom_parameters: {
        filter_type: filterType,
        filter_value: filterValue,
      },
    }),

  reportDateRangeChange: (startDate: string, endDate: string) =>
    trackEvent({
      action: 'change_date_range',
      category: 'Reports',
      label: 'date_range',
      custom_parameters: {
        start_date: startDate,
        end_date: endDate,
        days_span: Math.floor(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
    }),

  chartInteraction: (
    chartType: string,
    interactionType: string,
    dataPoint?: string
  ) =>
    trackEvent({
      action: 'interact_chart',
      category: 'Data Visualization',
      label: chartType,
      custom_parameters: {
        chart_type: chartType,
        interaction_type: interactionType, // 'hover', 'click', 'zoom', 'drill-down'
        data_point: dataPoint,
      },
    }),

  // === 🔍 검색 & 탐색 이벤트 ===
  searchGlobal: (
    searchTerm: string,
    searchType: string,
    resultsCount: number
  ) =>
    trackEvent({
      action: 'search_global',
      category: 'Search',
      label: searchTerm,
      custom_parameters: {
        search_term: searchTerm,
        search_type: searchType,
        results_count: resultsCount,
        search_length: searchTerm.length,
      },
    }),

  searchResultClick: (
    searchTerm: string,
    resultType: string,
    resultPosition: number
  ) =>
    trackEvent({
      action: 'click_search_result',
      category: 'Search',
      label: resultType,
      custom_parameters: {
        search_term: searchTerm,
        result_type: resultType,
        result_position: resultPosition,
      },
    }),

  // === 💾 데이터 관리 이벤트 ===
  dataExport: (dataType: string, exportFormat: string, recordCount: number) =>
    trackEvent({
      action: 'export_data',
      category: 'Data Management',
      label: dataType,
      custom_parameters: {
        data_type: dataType,
        export_format: exportFormat,
        record_count: recordCount,
      },
    }),

  dataImport: (dataType: string, importFormat: string, recordCount: number) =>
    trackEvent({
      action: 'import_data',
      category: 'Data Management',
      label: dataType,
      custom_parameters: {
        data_type: dataType,
        import_format: importFormat,
        record_count: recordCount,
      },
    }),

  // === 🔧 설정 상세 이벤트 ===
  settingsView: (settingsCategory: string) =>
    trackEvent({
      action: 'view_settings',
      category: 'Settings',
      label: settingsCategory,
      custom_parameters: {
        settings_category: settingsCategory,
      },
    }),

  notificationToggle: (notificationType: string, isEnabled: boolean) =>
    trackEvent({
      action: 'toggle_notification',
      category: 'Notifications',
      label: notificationType,
      custom_parameters: {
        notification_type: notificationType,
        is_enabled: isEnabled,
      },
    }),

  // === ⚡ 성능 & 사용성 이벤트 ===
  pageLoadTime: (pageName: string, loadTime: number) =>
    trackEvent({
      action: 'page_load_time',
      category: 'Performance',
      label: pageName,
      value: loadTime,
      custom_parameters: {
        page_name: pageName,
        load_time_ms: loadTime,
        is_slow_load: loadTime > 3000,
      },
    }),

  featureUsage: (
    featureName: string,
    usageContext: string,
    isFirstTime?: boolean
  ) =>
    trackEvent({
      action: 'use_feature',
      category: 'Feature Usage',
      label: featureName,
      custom_parameters: {
        feature_name: featureName,
        usage_context: usageContext,
        is_first_time: isFirstTime || false,
      },
    }),

  // === 📱 모바일 특화 이벤트 ===
  mobileSwipe: (swipeDirection: string, elementType: string) =>
    trackEvent({
      action: 'swipe_mobile',
      category: 'Mobile Interaction',
      label: swipeDirection,
      custom_parameters: {
        swipe_direction: swipeDirection,
        element_type: elementType,
      },
    }),

  mobileOrientation: (orientation: string) =>
    trackEvent({
      action: 'change_orientation',
      category: 'Mobile Interaction',
      label: orientation,
      custom_parameters: {
        orientation: orientation,
      },
    }),

  // === 🔬 사용자 행동 심층 분석 이벤트 ===

  // 사용자 의도 분석
  userIntentAnalysis: (intent: string, hesitations: number, velocity: number) =>
    trackEvent({
      action: 'analyze_user_intent',
      category: 'Behavioral Analysis',
      label: intent,
      custom_parameters: {
        intent_type: intent,
        hesitation_count: hesitations,
        mouse_velocity: velocity,
        confidence_level:
          hesitations < 2 ? 'high' : hesitations < 5 ? 'medium' : 'low',
      },
    }),

  // 감정 상태 분석
  emotionalStateAnalysis: (
    frustration: number,
    engagement: number,
    confidence: number
  ) =>
    trackEvent({
      action: 'analyze_emotional_state',
      category: 'Psychological Analysis',
      label: 'emotional_profile',
      custom_parameters: {
        frustration_score: frustration,
        engagement_score: engagement,
        confidence_score: confidence,
        emotional_state:
          frustration > 5
            ? 'frustrated'
            : engagement > 5
              ? 'engaged'
              : 'neutral',
        user_satisfaction: Math.max(0, engagement - frustration),
      },
    }),

  // 타이핑 속도 및 패턴 분석
  typingSpeedAnalysis: (wpm: number, keyCount: number) =>
    trackEvent({
      action: 'analyze_typing_pattern',
      category: 'Behavioral Analysis',
      label: 'typing_biometrics',
      custom_parameters: {
        words_per_minute: wpm,
        key_count: keyCount,
        typing_proficiency:
          wpm > 60
            ? 'expert'
            : wpm > 40
              ? 'proficient'
              : wpm > 20
                ? 'average'
                : 'beginner',
        input_method: 'keyboard',
      },
    }),

  // 페이지 성능 상세 분석
  pagePerformanceAnalysis: (
    loadTime: number,
    domTime: number,
    responseTime: number
  ) =>
    trackEvent({
      action: 'analyze_page_performance',
      category: 'Performance Analysis',
      label: 'load_metrics',
      value: loadTime,
      custom_parameters: {
        load_time_ms: loadTime,
        dom_content_loaded_ms: domTime,
        response_time_ms: responseTime,
        performance_grade:
          loadTime < 1000
            ? 'excellent'
            : loadTime < 3000
              ? 'good'
              : loadTime < 5000
                ? 'average'
                : 'poor',
        user_experience_impact: loadTime > 3000 ? 'negative' : 'positive',
      },
    }),

  // 리소스 로딩 성능
  resourceLoadPerformance: (resource: string, duration: number, size: number) =>
    trackEvent({
      action: 'analyze_resource_performance',
      category: 'Performance Analysis',
      label: resource,
      value: duration,
      custom_parameters: {
        resource_name: resource,
        load_duration_ms: duration,
        transfer_size_bytes: size,
        resource_type: resource.split('.').pop() || 'unknown',
      },
    }),

  // 생체인식 패턴 분석
  biometricSignature: (type: string, signature: string) =>
    trackEvent({
      action: 'analyze_biometric_pattern',
      category: 'Biometric Analysis',
      label: type,
      custom_parameters: {
        biometric_type: type,
        signature_hash: signature,
        analysis_timestamp: Date.now(),
      },
    }),

  // 마우스 히트맵 데이터
  mouseHeatmapData: (
    x: number,
    y: number,
    intensity: number,
    elementType?: string
  ) =>
    trackEvent({
      action: 'track_mouse_heatmap',
      category: 'User Interface Analysis',
      label: 'mouse_tracking',
      custom_parameters: {
        mouse_x: x,
        mouse_y: y,
        heat_intensity: intensity,
        element_type: elementType,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
      },
    }),

  // 스크롤 깊이 분석
  scrollDepthAnalysis: (
    depth: number,
    readingTime: number,
    pausePoints: number
  ) =>
    trackEvent({
      action: 'analyze_scroll_depth',
      category: 'Content Engagement',
      label: 'scroll_behavior',
      value: depth,
      custom_parameters: {
        scroll_depth_percentage: depth,
        reading_time_seconds: readingTime,
        pause_points_count: pausePoints,
        reading_speed: readingTime > 0 ? depth / readingTime : 0,
        engagement_level: depth > 80 ? 'high' : depth > 50 ? 'medium' : 'low',
      },
    }),

  // 주의집중 패턴
  attentionPatternAnalysis: (
    focusTime: number,
    blurTime: number,
    tabSwitches: number
  ) =>
    trackEvent({
      action: 'analyze_attention_pattern',
      category: 'Cognitive Analysis',
      label: 'attention_metrics',
      custom_parameters: {
        focus_time_ms: focusTime,
        blur_time_ms: blurTime,
        tab_switches_count: tabSwitches,
        attention_ratio: focusTime / (focusTime + blurTime),
        multitasking_level:
          tabSwitches > 10 ? 'high' : tabSwitches > 5 ? 'medium' : 'low',
      },
    }),

  // 의사결정 패턴 분석
  decisionMakingPattern: (
    elementType: string,
    hesitationTime: number,
    clickDelay: number
  ) =>
    trackEvent({
      action: 'analyze_decision_pattern',
      category: 'Decision Analysis',
      label: elementType,
      custom_parameters: {
        element_type: elementType,
        hesitation_time_ms: hesitationTime,
        click_delay_ms: clickDelay,
        decision_confidence:
          clickDelay < 1000
            ? 'confident'
            : clickDelay < 3000
              ? 'hesitant'
              : 'uncertain',
        cognitive_load:
          hesitationTime > 2000
            ? 'high'
            : hesitationTime > 1000
              ? 'medium'
              : 'low',
      },
    }),

  // 사용자 세그멘테이션 분석
  userSegmentAnalysis: (
    segment: string,
    characteristics: Record<string, any>
  ) =>
    trackEvent({
      action: 'analyze_user_segment',
      category: 'User Segmentation',
      label: segment,
      custom_parameters: {
        user_segment: segment,
        ...characteristics,
        segmentation_timestamp: Date.now(),
      },
    }),

  // 예측 행동 분석
  predictiveBehaviorAnalysis: (
    predictedAction: string,
    confidence: number,
    context: string
  ) =>
    trackEvent({
      action: 'analyze_predictive_behavior',
      category: 'Predictive Analytics',
      label: predictedAction,
      custom_parameters: {
        predicted_action: predictedAction,
        prediction_confidence: confidence,
        prediction_context: context,
        model_version: '1.0',
      },
    }),

  // 개인화 적용 추적
  personalizationApplied: (
    personalizationType: string,
    userId: string,
    effectiveness?: number
  ) =>
    trackEvent({
      action: 'apply_personalization',
      category: 'Personalization Engine',
      label: personalizationType,
      custom_parameters: {
        personalization_type: personalizationType,
        user_id_hash: userId.substring(0, 8), // 개인정보 보호를 위한 해시
        effectiveness_score: effectiveness,
        application_timestamp: Date.now(),
      },
    }),

  // 사용자 여정 분석
  userJourneyAnalysis: (
    journeyStage: string,
    timeSpent: number,
    conversionProbability: number
  ) =>
    trackEvent({
      action: 'analyze_user_journey',
      category: 'Journey Analytics',
      label: journeyStage,
      custom_parameters: {
        journey_stage: journeyStage,
        time_spent_ms: timeSpent,
        conversion_probability: conversionProbability,
        journey_completion_rate: conversionProbability * 100,
      },
    }),

  // A/B 테스트 참여 추적
  abTestParticipation: (
    testName: string,
    variant: string,
    userCharacteristics: Record<string, any>
  ) =>
    trackEvent({
      action: 'participate_ab_test',
      category: 'A/B Testing',
      label: testName,
      custom_parameters: {
        test_name: testName,
        test_variant: variant,
        ...userCharacteristics,
        test_start_time: Date.now(),
      },
    }),

  // 사용자 가치 계산
  userBusinessValueCalculation: (
    businessValue: number,
    factors: Record<string, number>
  ) =>
    trackEvent({
      action: 'calculate_business_value',
      category: 'Business Intelligence',
      label: 'user_value_calculation',
      value: businessValue,
      custom_parameters: {
        calculated_business_value: businessValue,
        ...factors,
        calculation_timestamp: Date.now(),
        value_tier:
          businessValue > 1000
            ? 'high_value'
            : businessValue > 500
              ? 'medium_value'
              : 'low_value',
      },
    }),

  // 실시간 행동 클러스터링
  behaviorClustering: (
    clusterName: string,
    clusterCharacteristics: Record<string, any>
  ) =>
    trackEvent({
      action: 'classify_behavior_cluster',
      category: 'Behavioral Clustering',
      label: clusterName,
      custom_parameters: {
        cluster_name: clusterName,
        ...clusterCharacteristics,
        clustering_algorithm: 'k_means',
        cluster_confidence: clusterCharacteristics.confidence || 0,
      },
    }),

  // 디바이스 사용 패턴
  deviceUsagePattern: (
    deviceInfo: Record<string, any>,
    usageMetrics: Record<string, any>
  ) =>
    trackEvent({
      action: 'analyze_device_usage',
      category: 'Device Analytics',
      label: 'usage_pattern',
      custom_parameters: {
        ...deviceInfo,
        ...usageMetrics,
        device_fingerprint: deviceInfo.fingerprint,
        usage_intensity: usageMetrics.intensity || 'normal',
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
