// 🎯 통합 스키마 파일: Drizzle 설정 및 전체 앱에서 사용

// ===== Core Schema (핵심 공유 테이블들) =====
export * from './core';

// ===== Public Schema (공개 페이지 관련) =====
export * from './public';

// ===== 통합 스키마 객체 (Drizzle 설정용) =====
import {
  // Core 테이블들
  authUsers,
  profiles,
  teams,
  clients,
  clientDetails,
  insuranceInfo,
  referrals,
  meetings,
  invitations,
  documents,
  pipelineStages,
  // Admin 테이블들
  adminAuditLogs,
  adminSettings,
  adminStatsCache,
  // Core Relations
  profilesRelations,
  teamsRelations,
  clientsRelations,
  clientDetailsRelations,
  insuranceInfoRelations,
  referralsRelations,
  meetingsRelations,
  invitationsRelations,
  documentsRelations,
  pipelineStagesRelations,
  // Admin Relations
  adminAuditLogsRelations,
  adminSettingsRelations,
} from './core';

import {
  // Public 테이블들
  publicContents,
  faqs,
  announcements,
  testimonials,
  siteSettings,
  pageViews,
  // Public Relations
  publicContentsRelations,
  faqsRelations,
  announcementsRelations,
  testimonialsRelations,
  siteSettingsRelations,
  pageViewsRelations,
} from './public';

// Calendar 기능 전용 테이블들 import (새로운 테이블들만)
import {
  // Calendar 테이블들
  appCalendarMeetingTemplates,
  appCalendarMeetingChecklists,
  appCalendarMeetingReminders,
  appCalendarMeetingAttendees,
  appCalendarMeetingNotes,
  appCalendarSettings,
  appCalendarRecurringMeetings,
  appCalendarSyncLogs,
  // Calendar Relations
  appCalendarMeetingTemplatesRelations,
  appCalendarMeetingChecklistsRelations,
  appCalendarMeetingRemindersRelations,
  appCalendarMeetingAttendeesRelations,
  appCalendarMeetingNotesRelations,
  appCalendarSettingsRelations,
  appCalendarRecurringMeetingsRelations,
  appCalendarSyncLogsRelations,
} from '~/features/calendar/lib/schema';

// Clients 기능 전용 테이블들 import (새로운 테이블들만)
import {
  // Clients 테이블들
  appClientTags,
  appClientTagAssignments,
  appClientContactHistory,
  appClientFamilyMembers,
  appClientPreferences,
  appClientAnalytics,
  appClientMilestones,
  appClientStageHistory,
  appClientDataAccessLogs,
  appClientDataBackups,
  // Clients Relations
  appClientTagsRelations,
  appClientTagAssignmentsRelations,
  appClientContactHistoryRelations,
  appClientFamilyMembersRelations,
  appClientPreferencesRelations,
  appClientAnalyticsRelations,
  appClientMilestonesRelations,
  appClientStageHistoryRelations,
  appClientDataAccessLogsRelations,
  appClientDataBackupsRelations,
} from '~/features/clients/lib/schema';

// Dashboard 기능 전용 테이블들 import (새로운 테이블들만)
import {
  // Dashboard 테이블들
  appDashboardPerformanceMetrics,
  appDashboardGoals,
  appDashboardActivityLogs,
  appDashboardNotifications,
  appDashboardWidgets,
  appDashboardQuickActions,
  // Dashboard Relations
  appDashboardPerformanceMetricsRelations,
  appDashboardGoalsRelations,
  appDashboardActivityLogsRelations,
  appDashboardNotificationsRelations,
  appDashboardWidgetsRelations,
  appDashboardQuickActionsRelations,
} from '~/features/dashboard/lib/schema';

// Influencers 기능 전용 테이블들 import (새로운 테이블들만)
import {
  // Influencers 테이블들
  appInfluencerProfiles,
  appInfluencerGratitudeHistory,
  appInfluencerNetworkAnalysis,
  appInfluencerActivityLogs,
  appInfluencerGratitudeTemplates,
  // Influencers Relations
  appInfluencerProfilesRelations,
  appInfluencerGratitudeHistoryRelations,
  appInfluencerNetworkAnalysisRelations,
  appInfluencerActivityLogsRelations,
  appInfluencerGratitudeTemplatesRelations,
} from '~/features/influencers/lib/schema';

// Invitations 기능 전용 테이블들 import (새로운 테이블들만)
import {
  // Invitations 테이블들
  appInvitationUsageLogs,
  // Invitations Relations
  appInvitationUsageLogsRelations,
} from '~/features/invitations/lib/schema';

// Network 기능 전용 테이블들 import (새로운 테이블들만)
import {
  // Network 테이블들
  appNetworkNodes,
  appNetworkEdges,
  appNetworkStats,
  appNetworkInteractions,
  appNetworkOpportunities,
  // Network Relations
  appNetworkNodesRelations,
  appNetworkEdgesRelations,
  appNetworkStatsRelations,
  appNetworkInteractionsRelations,
  appNetworkOpportunitiesRelations,
} from '~/features/network/lib/schema';

// Notifications 기능 전용 테이블들 import (새로운 테이블들만)
import {
  // Notifications 테이블들
  appNotificationSettings,
  appNotificationTemplates,
  appNotificationQueue,
  appNotificationHistory,
  appNotificationRules,
  appNotificationSubscriptions,
  // Notifications Relations
  appNotificationSettingsRelations,
  appNotificationTemplatesRelations,
  appNotificationQueueRelations,
  appNotificationHistoryRelations,
  appNotificationRulesRelations,
  appNotificationSubscriptionsRelations,
} from '~/features/notifications/lib/schema';

// Pipeline 기능 전용 테이블들 import (새로운 테이블들만)
import {
  // Pipeline 테이블들
  appPipelineStageHistory,
  appPipelineViews,
  appPipelineAnalytics,
  appPipelineStageTemplates,
  appPipelineGoals,
  // Pipeline Relations
  appPipelineStageHistoryRelations,
  appPipelineViewsRelations,
  appPipelineAnalyticsRelations,
  appPipelineGoalsRelations,
} from '~/features/pipeline/lib/schema';

// Reports 기능 전용 테이블들 import (새로운 테이블들만)
import {
  // Reports 테이블들
  reportTemplates,
  reportSchedules,
  reportInstances,
  reportDashboards,
  reportMetrics,
  reportExports,
  reportSubscriptions,
  // Reports Relations
  reportTemplatesRelations,
  reportSchedulesRelations,
  reportInstancesRelations,
  reportDashboardsRelations,
  reportMetricsRelations,
  reportExportsRelations,
  reportSubscriptionsRelations,
} from '~/features/reports/lib/schema';

// Settings 기능 전용 테이블들 import (새로운 테이블들만)
import {
  // Settings 테이블들
  appSettingsUserProfiles,
  appSettingsIntegrations,
  appSettingsBackups,
  appSettingsChangeLogs,
  appSettingsThemePreferences,
  appSettingsSecurityLogs,
  // Settings Relations
  appSettingsUserProfilesRelations,
  appSettingsIntegrationsRelations,
  appSettingsBackupsRelations,
  appSettingsChangeLogsRelations,
  appSettingsThemePreferencesRelations,
  appSettingsSecurityLogsRelations,
} from '~/features/settings/lib/schema';

// Team 기능 전용 테이블들 import (새로운 테이블들만)
import {
  // Team 테이블들
  appTeamMembers,
  appTeamStatsCache,
  appTeamPerformanceMetrics,
  appTeamGoals,
  appTeamActivityLogs,
  appTeamCommunicationChannels,
  appTeamTrainingRecords,
  // Team Relations
  appTeamMembersRelations,
  appTeamStatsCacheRelations,
  appTeamPerformanceMetricsRelations,
  appTeamGoalsRelations,
  appTeamActivityLogsRelations,
  appTeamCommunicationChannelsRelations,
  appTeamTrainingRecordsRelations,
} from '~/features/team/lib/schema';

// Drizzle 설정용 통합 스키마
export const schema = {
  // ===== Core 테이블들 =====
  authUsers,
  profiles,
  teams,
  clients,
  clientDetails,
  insuranceInfo,
  referrals,
  meetings,
  invitations,
  documents,
  pipelineStages,

  // ===== Admin 테이블들 =====
  adminAuditLogs,
  adminSettings,
  adminStatsCache,

  // ===== Calendar 기능 전용 테이블들 =====
  appCalendarMeetingTemplates,
  appCalendarMeetingChecklists,
  appCalendarMeetingReminders,
  appCalendarMeetingAttendees,
  appCalendarMeetingNotes,
  appCalendarSettings,
  appCalendarRecurringMeetings,
  appCalendarSyncLogs,

  // ===== Clients 기능 전용 테이블들 =====
  appClientTags,
  appClientTagAssignments,
  appClientContactHistory,
  appClientFamilyMembers,
  appClientPreferences,
  appClientAnalytics,
  appClientMilestones,
  appClientStageHistory,
  appClientDataAccessLogs,
  appClientDataBackups,

  // ===== Dashboard 기능 전용 테이블들 =====
  appDashboardPerformanceMetrics,
  appDashboardGoals,
  appDashboardActivityLogs,
  appDashboardNotifications,
  appDashboardWidgets,
  appDashboardQuickActions,

  // ===== Influencers 기능 전용 테이블들 =====
  appInfluencerProfiles,
  appInfluencerGratitudeHistory,
  appInfluencerNetworkAnalysis,
  appInfluencerActivityLogs,
  appInfluencerGratitudeTemplates,

  // ===== Invitations 기능 전용 테이블들 =====
  appInvitationUsageLogs,

  // ===== Network 기능 전용 테이블들 =====
  appNetworkNodes,
  appNetworkEdges,
  appNetworkStats,
  appNetworkInteractions,
  appNetworkOpportunities,

  // ===== Notifications 기능 전용 테이블들 =====
  appNotificationSettings,
  appNotificationTemplates,
  appNotificationQueue,
  appNotificationHistory,
  appNotificationRules,
  appNotificationSubscriptions,

  // ===== Pipeline 기능 전용 테이블들 =====
  appPipelineStageHistory,
  appPipelineViews,
  appPipelineAnalytics,
  appPipelineStageTemplates,
  appPipelineGoals,

  // ===== Reports 기능 전용 테이블들 =====
  reportTemplates,
  reportSchedules,
  reportInstances,
  reportDashboards,
  reportMetrics,
  reportExports,
  reportSubscriptions,

  // ===== Settings 기능 전용 테이블들 =====
  appSettingsUserProfiles,
  appSettingsIntegrations,
  appSettingsBackups,
  appSettingsChangeLogs,
  appSettingsThemePreferences,
  appSettingsSecurityLogs,

  // ===== Team 기능 전용 테이블들 =====
  appTeamMembers,
  appTeamStatsCache,
  appTeamPerformanceMetrics,
  appTeamGoals,
  appTeamActivityLogs,
  appTeamCommunicationChannels,
  appTeamTrainingRecords,

  // ===== Public 테이블들 =====
  publicContents,
  faqs,
  announcements,
  testimonials,
  siteSettings,
  pageViews,

  // ===== Relations =====
  profilesRelations,
  teamsRelations,
  clientsRelations,
  clientDetailsRelations,
  insuranceInfoRelations,
  referralsRelations,
  meetingsRelations,
  invitationsRelations,
  documentsRelations,
  pipelineStagesRelations,
  // Admin Relations
  adminAuditLogsRelations,
  adminSettingsRelations,
  // Calendar Relations
  appCalendarMeetingTemplatesRelations,
  appCalendarMeetingChecklistsRelations,
  appCalendarMeetingRemindersRelations,
  appCalendarMeetingAttendeesRelations,
  appCalendarMeetingNotesRelations,
  appCalendarSettingsRelations,
  appCalendarRecurringMeetingsRelations,
  appCalendarSyncLogsRelations,
  // Clients Relations
  appClientTagsRelations,
  appClientTagAssignmentsRelations,
  appClientContactHistoryRelations,
  appClientFamilyMembersRelations,
  appClientPreferencesRelations,
  appClientAnalyticsRelations,
  appClientMilestonesRelations,
  appClientStageHistoryRelations,
  appClientDataAccessLogsRelations,
  appClientDataBackupsRelations,
  // Dashboard Relations
  appDashboardPerformanceMetricsRelations,
  appDashboardGoalsRelations,
  appDashboardActivityLogsRelations,
  appDashboardNotificationsRelations,
  appDashboardWidgetsRelations,
  appDashboardQuickActionsRelations,
  // Influencers Relations
  appInfluencerProfilesRelations,
  appInfluencerGratitudeHistoryRelations,
  appInfluencerNetworkAnalysisRelations,
  appInfluencerActivityLogsRelations,
  appInfluencerGratitudeTemplatesRelations,
  // Public Relations
  publicContentsRelations,
  faqsRelations,
  announcementsRelations,
  testimonialsRelations,
  siteSettingsRelations,
  pageViewsRelations,
  // Invitations Relations
  appInvitationUsageLogsRelations,
  // Network Relations
  appNetworkNodesRelations,
  appNetworkEdgesRelations,
  appNetworkStatsRelations,
  appNetworkInteractionsRelations,
  appNetworkOpportunitiesRelations,
  // Notifications Relations
  appNotificationSettingsRelations,
  appNotificationTemplatesRelations,
  appNotificationQueueRelations,
  appNotificationHistoryRelations,
  appNotificationRulesRelations,
  appNotificationSubscriptionsRelations,
  // Pipeline Relations
  appPipelineStageHistoryRelations,
  appPipelineViewsRelations,
  appPipelineAnalyticsRelations,
  appPipelineGoalsRelations,
  // Reports Relations
  reportTemplatesRelations,
  reportSchedulesRelations,
  reportInstancesRelations,
  reportDashboardsRelations,
  reportMetricsRelations,
  reportExportsRelations,
  reportSubscriptionsRelations,
  // Settings Relations
  appSettingsUserProfilesRelations,
  appSettingsIntegrationsRelations,
  appSettingsBackupsRelations,
  appSettingsChangeLogsRelations,
  appSettingsThemePreferencesRelations,
  appSettingsSecurityLogsRelations,
  // Team Relations
  appTeamMembersRelations,
  appTeamStatsCacheRelations,
  appTeamPerformanceMetricsRelations,
  appTeamGoalsRelations,
  appTeamActivityLogsRelations,
  appTeamCommunicationChannelsRelations,
  appTeamTrainingRecordsRelations,
};

// 타입 정의
export type Schema = typeof schema;

// ===== SQL 트리거 (Supabase Auth 연동) =====
export const authTriggerSQL = `
-- 새 사용자가 auth.users에 생성될 때 app_user_profiles 테이블에 자동으로 레코드 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS 정책 설정
ALTER TABLE public.app_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_client_documents ENABLE ROW LEVEL SECURITY;

-- 프로필 접근 정책
CREATE POLICY "Users can view own profile" ON public.app_user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.app_user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 클라이언트 접근 정책
CREATE POLICY "Users can view own clients" ON public.app_client_profiles
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Users can insert own clients" ON public.app_client_profiles
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Users can update own clients" ON public.app_client_profiles
  FOR UPDATE USING (auth.uid() = admin_id);
`;
