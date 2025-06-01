import { relations } from 'drizzle-orm/relations';
import {
  appUserProfiles,
  appClientProfiles,
  appPipelineStages,
  appUserTeams,
  appClientDetails,
  usersInAuth,
  appClientDocuments,
  appClientInsurance,
  appUserInvitations,
  appClientMeetings,
  appClientReferrals,
  publicSiteAnnouncements,
  publicSiteFaqs,
  publicSiteAnalytics,
  publicSiteContents,
  publicSiteSettings,
  publicSiteTestimonials,
  appCalendarMeetingAttendees,
  appCalendarMeetingChecklists,
  appCalendarMeetingNotes,
  appCalendarMeetingReminders,
  appCalendarMeetingTemplates,
  appCalendarRecurringMeetings,
  appCalendarSettings,
  appCalendarSyncLogs,
  appClientAnalytics,
  appClientContactHistory,
  appClientDataAccessLogs,
  appClientDataBackups,
  appClientFamilyMembers,
  appClientMilestones,
  appClientPreferences,
  appClientStageHistory,
  appClientTagAssignments,
  appClientTags,
  appDashboardActivityLogs,
  appDashboardGoals,
  appDashboardNotifications,
  appDashboardPerformanceMetrics,
  appDashboardQuickActions,
  appDashboardWidgets,
  appInfluencerProfiles,
  appInfluencerActivityLogs,
  appInfluencerGratitudeHistory,
  appInfluencerGratitudeTemplates,
  appInfluencerNetworkAnalysis,
  appInvitationUsageLogs,
  appNetworkEdges,
  appNetworkNodes,
  appNetworkInteractions,
  appNetworkOpportunities,
  appNetworkStats,
  appNotificationQueue,
  appNotificationHistory,
  appNotificationTemplates,
  appNotificationRules,
  appNotificationSettings,
  appNotificationSubscriptions,
  appPipelineAnalytics,
  appPipelineAutomations,
  appPipelineGoals,
  appPipelineStageHistory,
  appPipelineStageTemplates,
  appPipelineViews,
  appReportDashboards,
  appReportInstances,
  appReportExports,
  appReportSchedules,
  appReportTemplates,
  appReportMetrics,
  appReportSubscriptions,
  appSettingsBackups,
  appSettingsChangeLogs,
  appSettingsIntegrations,
  appSettingsSecurityLogs,
  appSettingsThemePreferences,
  appSettingsUserProfiles,
  appTeamActivityLogs,
  appTeamCommunicationChannels,
  appTeamGoals,
  appTeamMembers,
  appTeamPerformanceMetrics,
  appTeamStatsCache,
  appTeamTrainingRecords,
} from './schema';

export const appClientProfilesRelations = relations(
  appClientProfiles,
  ({ one, many }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appClientProfiles.agentId],
      references: [appUserProfiles.id],
    }),
    appPipelineStage: one(appPipelineStages, {
      fields: [appClientProfiles.currentStageId],
      references: [appPipelineStages.id],
    }),
    appClientProfile: one(appClientProfiles, {
      fields: [appClientProfiles.referredById],
      references: [appClientProfiles.id],
      relationName: 'appClientProfiles_referredById_appClientProfiles_id',
    }),
    appClientProfiles: many(appClientProfiles, {
      relationName: 'appClientProfiles_referredById_appClientProfiles_id',
    }),
    appUserTeam: one(appUserTeams, {
      fields: [appClientProfiles.teamId],
      references: [appUserTeams.id],
    }),
    appClientDetails: many(appClientDetails),
    appClientDocuments: many(appClientDocuments),
    appClientInsurances: many(appClientInsurance),
    appClientMeetings: many(appClientMeetings),
    appClientReferrals_referredId: many(appClientReferrals, {
      relationName: 'appClientReferrals_referredId_appClientProfiles_id',
    }),
    appClientReferrals_referrerId: many(appClientReferrals, {
      relationName: 'appClientReferrals_referrerId_appClientProfiles_id',
    }),
    appCalendarMeetingAttendees: many(appCalendarMeetingAttendees),
    appClientAnalytics: many(appClientAnalytics),
    appClientContactHistories: many(appClientContactHistory),
    appClientDataAccessLogs: many(appClientDataAccessLogs),
    appClientDataBackups: many(appClientDataBackups),
    appClientFamilyMembers: many(appClientFamilyMembers),
    appClientMilestones: many(appClientMilestones),
    appClientPreferences: many(appClientPreferences),
    appClientStageHistories: many(appClientStageHistory),
    appClientTagAssignments: many(appClientTagAssignments),
    appInfluencerProfiles: many(appInfluencerProfiles),
    appNetworkNodes: many(appNetworkNodes),
    appPipelineStageHistories: many(appPipelineStageHistory),
  })
);

export const appUserProfilesRelations = relations(
  appUserProfiles,
  ({ one, many }) => ({
    appClientProfiles: many(appClientProfiles),
    usersInAuth: one(usersInAuth, {
      fields: [appUserProfiles.id],
      references: [usersInAuth.id],
    }),
    appUserTeams: many(appUserTeams),
    appPipelineStages: many(appPipelineStages),
    appClientDocuments: many(appClientDocuments),
    appUserInvitations_inviterId: many(appUserInvitations, {
      relationName: 'appUserInvitations_inviterId_appUserProfiles_id',
    }),
    appUserInvitations_usedById: many(appUserInvitations, {
      relationName: 'appUserInvitations_usedById_appUserProfiles_id',
    }),
    appClientMeetings: many(appClientMeetings),
    appClientReferrals: many(appClientReferrals),
    publicSiteAnnouncements: many(publicSiteAnnouncements),
    publicSiteFaqs: many(publicSiteFaqs),
    publicSiteAnalytics: many(publicSiteAnalytics),
    publicSiteContents: many(publicSiteContents),
    publicSiteSettings: many(publicSiteSettings),
    publicSiteTestimonials: many(publicSiteTestimonials),
    appCalendarMeetingAttendees: many(appCalendarMeetingAttendees),
    appCalendarMeetingNotes: many(appCalendarMeetingNotes),
    appCalendarMeetingTemplates: many(appCalendarMeetingTemplates),
    appCalendarSettings: many(appCalendarSettings),
    appCalendarSyncLogs: many(appCalendarSyncLogs),
    appClientContactHistories: many(appClientContactHistory),
    appClientDataAccessLogs: many(appClientDataAccessLogs),
    appClientDataBackups: many(appClientDataBackups),
    appClientMilestones: many(appClientMilestones),
    appClientStageHistories: many(appClientStageHistory),
    appClientTagAssignments: many(appClientTagAssignments),
    appClientTags: many(appClientTags),
    appDashboardActivityLogs: many(appDashboardActivityLogs),
    appDashboardGoals: many(appDashboardGoals),
    appDashboardNotifications: many(appDashboardNotifications),
    appDashboardPerformanceMetrics: many(appDashboardPerformanceMetrics),
    appDashboardQuickActions: many(appDashboardQuickActions),
    appDashboardWidgets: many(appDashboardWidgets),
    appInfluencerProfiles_agentId: many(appInfluencerProfiles, {
      relationName: 'appInfluencerProfiles_agentId_appUserProfiles_id',
    }),
    appInfluencerProfiles_verifiedBy: many(appInfluencerProfiles, {
      relationName: 'appInfluencerProfiles_verifiedBy_appUserProfiles_id',
    }),
    appInfluencerActivityLogs: many(appInfluencerActivityLogs),
    appInfluencerGratitudeHistories: many(appInfluencerGratitudeHistory),
    appInfluencerGratitudeTemplates: many(appInfluencerGratitudeTemplates),
    appInfluencerNetworkAnalyses: many(appInfluencerNetworkAnalysis),
    appInvitationUsageLogs: many(appInvitationUsageLogs),
    appNetworkEdges: many(appNetworkEdges),
    appNetworkNodes: many(appNetworkNodes),
    appNetworkInteractions: many(appNetworkInteractions),
    appNetworkOpportunities: many(appNetworkOpportunities),
    appNetworkStats: many(appNetworkStats),
    appNotificationHistories: many(appNotificationHistory),
    appNotificationQueues: many(appNotificationQueue),
    appNotificationTemplates: many(appNotificationTemplates),
    appNotificationRules: many(appNotificationRules),
    appNotificationSettings: many(appNotificationSettings),
    appNotificationSubscriptions: many(appNotificationSubscriptions),
    appPipelineAnalytics: many(appPipelineAnalytics),
    appPipelineAutomations: many(appPipelineAutomations),
    appPipelineGoals: many(appPipelineGoals),
    appPipelineStageHistories: many(appPipelineStageHistory),
    appPipelineStageTemplates: many(appPipelineStageTemplates),
    appPipelineViews: many(appPipelineViews),
    appReportDashboards: many(appReportDashboards),
    appReportExports: many(appReportExports),
    appReportInstances: many(appReportInstances),
    appReportTemplates: many(appReportTemplates),
    appReportSchedules: many(appReportSchedules),
    appReportMetrics: many(appReportMetrics),
    appReportSubscriptions: many(appReportSubscriptions),
    appSettingsBackups: many(appSettingsBackups),
    appSettingsChangeLogs: many(appSettingsChangeLogs),
    appSettingsIntegrations: many(appSettingsIntegrations),
    appSettingsSecurityLogs: many(appSettingsSecurityLogs),
    appSettingsThemePreferences: many(appSettingsThemePreferences),
    appSettingsUserProfiles: many(appSettingsUserProfiles),
    appTeamActivityLogs: many(appTeamActivityLogs),
    appTeamCommunicationChannels: many(appTeamCommunicationChannels),
    appTeamGoals: many(appTeamGoals),
    appTeamMembers_invitedBy: many(appTeamMembers, {
      relationName: 'appTeamMembers_invitedBy_appUserProfiles_id',
    }),
    appTeamMembers_userId: many(appTeamMembers, {
      relationName: 'appTeamMembers_userId_appUserProfiles_id',
    }),
    appTeamPerformanceMetrics: many(appTeamPerformanceMetrics),
    appTeamTrainingRecords_memberId: many(appTeamTrainingRecords, {
      relationName: 'appTeamTrainingRecords_memberId_appUserProfiles_id',
    }),
    appTeamTrainingRecords_trainerId: many(appTeamTrainingRecords, {
      relationName: 'appTeamTrainingRecords_trainerId_appUserProfiles_id',
    }),
  })
);

export const appPipelineStagesRelations = relations(
  appPipelineStages,
  ({ one, many }) => ({
    appClientProfiles: many(appClientProfiles),
    appUserProfile: one(appUserProfiles, {
      fields: [appPipelineStages.agentId],
      references: [appUserProfiles.id],
    }),
    appUserTeam: one(appUserTeams, {
      fields: [appPipelineStages.teamId],
      references: [appUserTeams.id],
    }),
    appClientStageHistories_fromStageId: many(appClientStageHistory, {
      relationName: 'appClientStageHistory_fromStageId_appPipelineStages_id',
    }),
    appClientStageHistories_toStageId: many(appClientStageHistory, {
      relationName: 'appClientStageHistory_toStageId_appPipelineStages_id',
    }),
    appPipelineAnalytics: many(appPipelineAnalytics),
    appPipelineAutomations: many(appPipelineAutomations),
    appPipelineGoals: many(appPipelineGoals),
    appPipelineStageHistories_fromStageId: many(appPipelineStageHistory, {
      relationName: 'appPipelineStageHistory_fromStageId_appPipelineStages_id',
    }),
    appPipelineStageHistories_toStageId: many(appPipelineStageHistory, {
      relationName: 'appPipelineStageHistory_toStageId_appPipelineStages_id',
    }),
  })
);

export const appUserTeamsRelations = relations(
  appUserTeams,
  ({ one, many }) => ({
    appClientProfiles: many(appClientProfiles),
    appUserProfile: one(appUserProfiles, {
      fields: [appUserTeams.adminId],
      references: [appUserProfiles.id],
    }),
    appPipelineStages: many(appPipelineStages),
    appDashboardGoals: many(appDashboardGoals),
    appDashboardPerformanceMetrics: many(appDashboardPerformanceMetrics),
    appInfluencerNetworkAnalyses: many(appInfluencerNetworkAnalysis),
    appNetworkStats: many(appNetworkStats),
    appNotificationTemplates: many(appNotificationTemplates),
    appNotificationRules: many(appNotificationRules),
    appPipelineAnalytics: many(appPipelineAnalytics),
    appPipelineAutomations: many(appPipelineAutomations),
    appPipelineGoals: many(appPipelineGoals),
    appPipelineStageTemplates: many(appPipelineStageTemplates),
    appPipelineViews: many(appPipelineViews),
    appReportDashboards: many(appReportDashboards),
    appReportTemplates: many(appReportTemplates),
    appReportSchedules: many(appReportSchedules),
    appReportMetrics: many(appReportMetrics),
    appTeamActivityLogs: many(appTeamActivityLogs),
    appTeamCommunicationChannels: many(appTeamCommunicationChannels),
    appTeamGoals: many(appTeamGoals),
    appTeamMembers: many(appTeamMembers),
    appTeamPerformanceMetrics: many(appTeamPerformanceMetrics),
    appTeamStatsCaches: many(appTeamStatsCache),
    appTeamTrainingRecords: many(appTeamTrainingRecords),
  })
);

export const appClientDetailsRelations = relations(
  appClientDetails,
  ({ one }) => ({
    appClientProfile: one(appClientProfiles, {
      fields: [appClientDetails.clientId],
      references: [appClientProfiles.id],
    }),
  })
);

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  appUserProfiles: many(appUserProfiles),
}));

export const appClientDocumentsRelations = relations(
  appClientDocuments,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appClientDocuments.agentId],
      references: [appUserProfiles.id],
    }),
    appClientProfile: one(appClientProfiles, {
      fields: [appClientDocuments.clientId],
      references: [appClientProfiles.id],
    }),
    appClientInsurance: one(appClientInsurance, {
      fields: [appClientDocuments.insuranceInfoId],
      references: [appClientInsurance.id],
    }),
  })
);

export const appClientInsuranceRelations = relations(
  appClientInsurance,
  ({ one, many }) => ({
    appClientDocuments: many(appClientDocuments),
    appClientProfile: one(appClientProfiles, {
      fields: [appClientInsurance.clientId],
      references: [appClientProfiles.id],
    }),
  })
);

export const appUserInvitationsRelations = relations(
  appUserInvitations,
  ({ one, many }) => ({
    appUserProfile_inviterId: one(appUserProfiles, {
      fields: [appUserInvitations.inviterId],
      references: [appUserProfiles.id],
      relationName: 'appUserInvitations_inviterId_appUserProfiles_id',
    }),
    appUserProfile_usedById: one(appUserProfiles, {
      fields: [appUserInvitations.usedById],
      references: [appUserProfiles.id],
      relationName: 'appUserInvitations_usedById_appUserProfiles_id',
    }),
    appInvitationUsageLogs: many(appInvitationUsageLogs),
  })
);

export const appClientMeetingsRelations = relations(
  appClientMeetings,
  ({ one, many }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appClientMeetings.agentId],
      references: [appUserProfiles.id],
    }),
    appClientProfile: one(appClientProfiles, {
      fields: [appClientMeetings.clientId],
      references: [appClientProfiles.id],
    }),
    appCalendarMeetingAttendees: many(appCalendarMeetingAttendees),
    appCalendarMeetingChecklists: many(appCalendarMeetingChecklists),
    appCalendarMeetingNotes: many(appCalendarMeetingNotes),
    appCalendarMeetingReminders: many(appCalendarMeetingReminders),
    appCalendarRecurringMeetings: many(appCalendarRecurringMeetings),
    appCalendarSyncLogs: many(appCalendarSyncLogs),
  })
);

export const appClientReferralsRelations = relations(
  appClientReferrals,
  ({ one, many }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appClientReferrals.agentId],
      references: [appUserProfiles.id],
    }),
    appClientProfile_referredId: one(appClientProfiles, {
      fields: [appClientReferrals.referredId],
      references: [appClientProfiles.id],
      relationName: 'appClientReferrals_referredId_appClientProfiles_id',
    }),
    appClientProfile_referrerId: one(appClientProfiles, {
      fields: [appClientReferrals.referrerId],
      references: [appClientProfiles.id],
      relationName: 'appClientReferrals_referrerId_appClientProfiles_id',
    }),
    appInfluencerGratitudeHistories: many(appInfluencerGratitudeHistory),
  })
);

export const publicSiteAnnouncementsRelations = relations(
  publicSiteAnnouncements,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [publicSiteAnnouncements.authorId],
      references: [appUserProfiles.id],
    }),
  })
);

export const publicSiteFaqsRelations = relations(publicSiteFaqs, ({ one }) => ({
  appUserProfile: one(appUserProfiles, {
    fields: [publicSiteFaqs.authorId],
    references: [appUserProfiles.id],
  }),
}));

export const publicSiteAnalyticsRelations = relations(
  publicSiteAnalytics,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [publicSiteAnalytics.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const publicSiteContentsRelations = relations(
  publicSiteContents,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [publicSiteContents.authorId],
      references: [appUserProfiles.id],
    }),
  })
);

export const publicSiteSettingsRelations = relations(
  publicSiteSettings,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [publicSiteSettings.updatedBy],
      references: [appUserProfiles.id],
    }),
  })
);

export const publicSiteTestimonialsRelations = relations(
  publicSiteTestimonials,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [publicSiteTestimonials.authorId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appCalendarMeetingAttendeesRelations = relations(
  appCalendarMeetingAttendees,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appCalendarMeetingAttendees.agentId],
      references: [appUserProfiles.id],
    }),
    appClientProfile: one(appClientProfiles, {
      fields: [appCalendarMeetingAttendees.clientId],
      references: [appClientProfiles.id],
    }),
    appClientMeeting: one(appClientMeetings, {
      fields: [appCalendarMeetingAttendees.meetingId],
      references: [appClientMeetings.id],
    }),
  })
);

export const appCalendarMeetingChecklistsRelations = relations(
  appCalendarMeetingChecklists,
  ({ one }) => ({
    appClientMeeting: one(appClientMeetings, {
      fields: [appCalendarMeetingChecklists.meetingId],
      references: [appClientMeetings.id],
    }),
  })
);

export const appCalendarMeetingNotesRelations = relations(
  appCalendarMeetingNotes,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appCalendarMeetingNotes.agentId],
      references: [appUserProfiles.id],
    }),
    appClientMeeting: one(appClientMeetings, {
      fields: [appCalendarMeetingNotes.meetingId],
      references: [appClientMeetings.id],
    }),
  })
);

export const appCalendarMeetingRemindersRelations = relations(
  appCalendarMeetingReminders,
  ({ one }) => ({
    appClientMeeting: one(appClientMeetings, {
      fields: [appCalendarMeetingReminders.meetingId],
      references: [appClientMeetings.id],
    }),
  })
);

export const appCalendarMeetingTemplatesRelations = relations(
  appCalendarMeetingTemplates,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appCalendarMeetingTemplates.agentId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appCalendarRecurringMeetingsRelations = relations(
  appCalendarRecurringMeetings,
  ({ one }) => ({
    appClientMeeting: one(appClientMeetings, {
      fields: [appCalendarRecurringMeetings.parentMeetingId],
      references: [appClientMeetings.id],
    }),
  })
);

export const appCalendarSettingsRelations = relations(
  appCalendarSettings,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appCalendarSettings.agentId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appCalendarSyncLogsRelations = relations(
  appCalendarSyncLogs,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appCalendarSyncLogs.agentId],
      references: [appUserProfiles.id],
    }),
    appClientMeeting: one(appClientMeetings, {
      fields: [appCalendarSyncLogs.meetingId],
      references: [appClientMeetings.id],
    }),
  })
);

export const appClientAnalyticsRelations = relations(
  appClientAnalytics,
  ({ one }) => ({
    appClientProfile: one(appClientProfiles, {
      fields: [appClientAnalytics.clientId],
      references: [appClientProfiles.id],
    }),
  })
);

export const appClientContactHistoryRelations = relations(
  appClientContactHistory,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appClientContactHistory.agentId],
      references: [appUserProfiles.id],
    }),
    appClientProfile: one(appClientProfiles, {
      fields: [appClientContactHistory.clientId],
      references: [appClientProfiles.id],
    }),
  })
);

export const appClientDataAccessLogsRelations = relations(
  appClientDataAccessLogs,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appClientDataAccessLogs.accessedBy],
      references: [appUserProfiles.id],
    }),
    appClientProfile: one(appClientProfiles, {
      fields: [appClientDataAccessLogs.clientId],
      references: [appClientProfiles.id],
    }),
  })
);

export const appClientDataBackupsRelations = relations(
  appClientDataBackups,
  ({ one }) => ({
    appClientProfile: one(appClientProfiles, {
      fields: [appClientDataBackups.clientId],
      references: [appClientProfiles.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appClientDataBackups.triggeredBy],
      references: [appUserProfiles.id],
    }),
  })
);

export const appClientFamilyMembersRelations = relations(
  appClientFamilyMembers,
  ({ one }) => ({
    appClientProfile: one(appClientProfiles, {
      fields: [appClientFamilyMembers.clientId],
      references: [appClientProfiles.id],
    }),
  })
);

export const appClientMilestonesRelations = relations(
  appClientMilestones,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appClientMilestones.agentId],
      references: [appUserProfiles.id],
    }),
    appClientProfile: one(appClientProfiles, {
      fields: [appClientMilestones.clientId],
      references: [appClientProfiles.id],
    }),
  })
);

export const appClientPreferencesRelations = relations(
  appClientPreferences,
  ({ one }) => ({
    appClientProfile: one(appClientProfiles, {
      fields: [appClientPreferences.clientId],
      references: [appClientProfiles.id],
    }),
  })
);

export const appClientStageHistoryRelations = relations(
  appClientStageHistory,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appClientStageHistory.agentId],
      references: [appUserProfiles.id],
    }),
    appClientProfile: one(appClientProfiles, {
      fields: [appClientStageHistory.clientId],
      references: [appClientProfiles.id],
    }),
    appPipelineStage_fromStageId: one(appPipelineStages, {
      fields: [appClientStageHistory.fromStageId],
      references: [appPipelineStages.id],
      relationName: 'appClientStageHistory_fromStageId_appPipelineStages_id',
    }),
    appPipelineStage_toStageId: one(appPipelineStages, {
      fields: [appClientStageHistory.toStageId],
      references: [appPipelineStages.id],
      relationName: 'appClientStageHistory_toStageId_appPipelineStages_id',
    }),
  })
);

export const appClientTagAssignmentsRelations = relations(
  appClientTagAssignments,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appClientTagAssignments.assignedBy],
      references: [appUserProfiles.id],
    }),
    appClientProfile: one(appClientProfiles, {
      fields: [appClientTagAssignments.clientId],
      references: [appClientProfiles.id],
    }),
    appClientTag: one(appClientTags, {
      fields: [appClientTagAssignments.tagId],
      references: [appClientTags.id],
    }),
  })
);

export const appClientTagsRelations = relations(
  appClientTags,
  ({ one, many }) => ({
    appClientTagAssignments: many(appClientTagAssignments),
    appUserProfile: one(appUserProfiles, {
      fields: [appClientTags.agentId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appDashboardActivityLogsRelations = relations(
  appDashboardActivityLogs,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appDashboardActivityLogs.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appDashboardGoalsRelations = relations(
  appDashboardGoals,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appDashboardGoals.agentId],
      references: [appUserProfiles.id],
    }),
    appUserTeam: one(appUserTeams, {
      fields: [appDashboardGoals.teamId],
      references: [appUserTeams.id],
    }),
  })
);

export const appDashboardNotificationsRelations = relations(
  appDashboardNotifications,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appDashboardNotifications.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appDashboardPerformanceMetricsRelations = relations(
  appDashboardPerformanceMetrics,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appDashboardPerformanceMetrics.agentId],
      references: [appUserProfiles.id],
    }),
    appUserTeam: one(appUserTeams, {
      fields: [appDashboardPerformanceMetrics.teamId],
      references: [appUserTeams.id],
    }),
  })
);

export const appDashboardQuickActionsRelations = relations(
  appDashboardQuickActions,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appDashboardQuickActions.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appDashboardWidgetsRelations = relations(
  appDashboardWidgets,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appDashboardWidgets.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appInfluencerProfilesRelations = relations(
  appInfluencerProfiles,
  ({ one, many }) => ({
    appUserProfile_agentId: one(appUserProfiles, {
      fields: [appInfluencerProfiles.agentId],
      references: [appUserProfiles.id],
      relationName: 'appInfluencerProfiles_agentId_appUserProfiles_id',
    }),
    appClientProfile: one(appClientProfiles, {
      fields: [appInfluencerProfiles.clientId],
      references: [appClientProfiles.id],
    }),
    appUserProfile_verifiedBy: one(appUserProfiles, {
      fields: [appInfluencerProfiles.verifiedBy],
      references: [appUserProfiles.id],
      relationName: 'appInfluencerProfiles_verifiedBy_appUserProfiles_id',
    }),
    appInfluencerActivityLogs: many(appInfluencerActivityLogs),
    appInfluencerGratitudeHistories: many(appInfluencerGratitudeHistory),
  })
);

export const appInfluencerActivityLogsRelations = relations(
  appInfluencerActivityLogs,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appInfluencerActivityLogs.agentId],
      references: [appUserProfiles.id],
    }),
    appInfluencerProfile: one(appInfluencerProfiles, {
      fields: [appInfluencerActivityLogs.influencerId],
      references: [appInfluencerProfiles.id],
    }),
  })
);

export const appInfluencerGratitudeHistoryRelations = relations(
  appInfluencerGratitudeHistory,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appInfluencerGratitudeHistory.agentId],
      references: [appUserProfiles.id],
    }),
    appInfluencerProfile: one(appInfluencerProfiles, {
      fields: [appInfluencerGratitudeHistory.influencerId],
      references: [appInfluencerProfiles.id],
    }),
    appClientReferral: one(appClientReferrals, {
      fields: [appInfluencerGratitudeHistory.referralId],
      references: [appClientReferrals.id],
    }),
  })
);

export const appInfluencerGratitudeTemplatesRelations = relations(
  appInfluencerGratitudeTemplates,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appInfluencerGratitudeTemplates.agentId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appInfluencerNetworkAnalysisRelations = relations(
  appInfluencerNetworkAnalysis,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appInfluencerNetworkAnalysis.agentId],
      references: [appUserProfiles.id],
    }),
    appUserTeam: one(appUserTeams, {
      fields: [appInfluencerNetworkAnalysis.teamId],
      references: [appUserTeams.id],
    }),
  })
);

export const appInvitationUsageLogsRelations = relations(
  appInvitationUsageLogs,
  ({ one }) => ({
    appUserInvitation: one(appUserInvitations, {
      fields: [appInvitationUsageLogs.invitationId],
      references: [appUserInvitations.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appInvitationUsageLogs.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appNetworkEdgesRelations = relations(
  appNetworkEdges,
  ({ one, many }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appNetworkEdges.agentId],
      references: [appUserProfiles.id],
    }),
    appNetworkNode_sourceNodeId: one(appNetworkNodes, {
      fields: [appNetworkEdges.sourceNodeId],
      references: [appNetworkNodes.id],
      relationName: 'appNetworkEdges_sourceNodeId_appNetworkNodes_id',
    }),
    appNetworkNode_targetNodeId: one(appNetworkNodes, {
      fields: [appNetworkEdges.targetNodeId],
      references: [appNetworkNodes.id],
      relationName: 'appNetworkEdges_targetNodeId_appNetworkNodes_id',
    }),
    appNetworkInteractions: many(appNetworkInteractions),
  })
);

export const appNetworkNodesRelations = relations(
  appNetworkNodes,
  ({ one, many }) => ({
    appNetworkEdges_sourceNodeId: many(appNetworkEdges, {
      relationName: 'appNetworkEdges_sourceNodeId_appNetworkNodes_id',
    }),
    appNetworkEdges_targetNodeId: many(appNetworkEdges, {
      relationName: 'appNetworkEdges_targetNodeId_appNetworkNodes_id',
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appNetworkNodes.agentId],
      references: [appUserProfiles.id],
    }),
    appClientProfile: one(appClientProfiles, {
      fields: [appNetworkNodes.clientId],
      references: [appClientProfiles.id],
    }),
    appNetworkOpportunities_sourceNodeId: many(appNetworkOpportunities, {
      relationName: 'appNetworkOpportunities_sourceNodeId_appNetworkNodes_id',
    }),
    appNetworkOpportunities_targetNodeId: many(appNetworkOpportunities, {
      relationName: 'appNetworkOpportunities_targetNodeId_appNetworkNodes_id',
    }),
  })
);

export const appNetworkInteractionsRelations = relations(
  appNetworkInteractions,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appNetworkInteractions.agentId],
      references: [appUserProfiles.id],
    }),
    appNetworkEdge: one(appNetworkEdges, {
      fields: [appNetworkInteractions.edgeId],
      references: [appNetworkEdges.id],
    }),
  })
);

export const appNetworkOpportunitiesRelations = relations(
  appNetworkOpportunities,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appNetworkOpportunities.agentId],
      references: [appUserProfiles.id],
    }),
    appNetworkNode_sourceNodeId: one(appNetworkNodes, {
      fields: [appNetworkOpportunities.sourceNodeId],
      references: [appNetworkNodes.id],
      relationName: 'appNetworkOpportunities_sourceNodeId_appNetworkNodes_id',
    }),
    appNetworkNode_targetNodeId: one(appNetworkNodes, {
      fields: [appNetworkOpportunities.targetNodeId],
      references: [appNetworkNodes.id],
      relationName: 'appNetworkOpportunities_targetNodeId_appNetworkNodes_id',
    }),
  })
);

export const appNetworkStatsRelations = relations(
  appNetworkStats,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appNetworkStats.agentId],
      references: [appUserProfiles.id],
    }),
    appUserTeam: one(appUserTeams, {
      fields: [appNetworkStats.teamId],
      references: [appUserTeams.id],
    }),
  })
);

export const appNotificationHistoryRelations = relations(
  appNotificationHistory,
  ({ one }) => ({
    appNotificationQueue: one(appNotificationQueue, {
      fields: [appNotificationHistory.queueId],
      references: [appNotificationQueue.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appNotificationHistory.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appNotificationQueueRelations = relations(
  appNotificationQueue,
  ({ one, many }) => ({
    appNotificationHistories: many(appNotificationHistory),
    appNotificationTemplate: one(appNotificationTemplates, {
      fields: [appNotificationQueue.templateId],
      references: [appNotificationTemplates.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appNotificationQueue.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appNotificationTemplatesRelations = relations(
  appNotificationTemplates,
  ({ one, many }) => ({
    appNotificationQueues: many(appNotificationQueue),
    appUserTeam: one(appUserTeams, {
      fields: [appNotificationTemplates.teamId],
      references: [appUserTeams.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appNotificationTemplates.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appNotificationRulesRelations = relations(
  appNotificationRules,
  ({ one }) => ({
    appUserTeam: one(appUserTeams, {
      fields: [appNotificationRules.teamId],
      references: [appUserTeams.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appNotificationRules.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appNotificationSettingsRelations = relations(
  appNotificationSettings,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appNotificationSettings.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appNotificationSubscriptionsRelations = relations(
  appNotificationSubscriptions,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appNotificationSubscriptions.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appPipelineAnalyticsRelations = relations(
  appPipelineAnalytics,
  ({ one }) => ({
    appPipelineStage: one(appPipelineStages, {
      fields: [appPipelineAnalytics.stageId],
      references: [appPipelineStages.id],
    }),
    appUserTeam: one(appUserTeams, {
      fields: [appPipelineAnalytics.teamId],
      references: [appUserTeams.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appPipelineAnalytics.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appPipelineAutomationsRelations = relations(
  appPipelineAutomations,
  ({ one }) => ({
    appPipelineStage: one(appPipelineStages, {
      fields: [appPipelineAutomations.stageId],
      references: [appPipelineStages.id],
    }),
    appUserTeam: one(appUserTeams, {
      fields: [appPipelineAutomations.teamId],
      references: [appUserTeams.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appPipelineAutomations.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appPipelineGoalsRelations = relations(
  appPipelineGoals,
  ({ one }) => ({
    appPipelineStage: one(appPipelineStages, {
      fields: [appPipelineGoals.stageId],
      references: [appPipelineStages.id],
    }),
    appUserTeam: one(appUserTeams, {
      fields: [appPipelineGoals.teamId],
      references: [appUserTeams.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appPipelineGoals.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appPipelineStageHistoryRelations = relations(
  appPipelineStageHistory,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appPipelineStageHistory.changedBy],
      references: [appUserProfiles.id],
    }),
    appClientProfile: one(appClientProfiles, {
      fields: [appPipelineStageHistory.clientId],
      references: [appClientProfiles.id],
    }),
    appPipelineStage_fromStageId: one(appPipelineStages, {
      fields: [appPipelineStageHistory.fromStageId],
      references: [appPipelineStages.id],
      relationName: 'appPipelineStageHistory_fromStageId_appPipelineStages_id',
    }),
    appPipelineStage_toStageId: one(appPipelineStages, {
      fields: [appPipelineStageHistory.toStageId],
      references: [appPipelineStages.id],
      relationName: 'appPipelineStageHistory_toStageId_appPipelineStages_id',
    }),
  })
);

export const appPipelineStageTemplatesRelations = relations(
  appPipelineStageTemplates,
  ({ one }) => ({
    appUserTeam: one(appUserTeams, {
      fields: [appPipelineStageTemplates.teamId],
      references: [appUserTeams.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appPipelineStageTemplates.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appPipelineViewsRelations = relations(
  appPipelineViews,
  ({ one }) => ({
    appUserTeam: one(appUserTeams, {
      fields: [appPipelineViews.teamId],
      references: [appUserTeams.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appPipelineViews.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appReportDashboardsRelations = relations(
  appReportDashboards,
  ({ one }) => ({
    appUserTeam: one(appUserTeams, {
      fields: [appReportDashboards.teamId],
      references: [appUserTeams.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appReportDashboards.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appReportExportsRelations = relations(
  appReportExports,
  ({ one }) => ({
    appReportInstance: one(appReportInstances, {
      fields: [appReportExports.reportInstanceId],
      references: [appReportInstances.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appReportExports.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appReportInstancesRelations = relations(
  appReportInstances,
  ({ one, many }) => ({
    appReportExports: many(appReportExports),
    appReportSchedule: one(appReportSchedules, {
      fields: [appReportInstances.scheduleId],
      references: [appReportSchedules.id],
    }),
    appReportTemplate: one(appReportTemplates, {
      fields: [appReportInstances.templateId],
      references: [appReportTemplates.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appReportInstances.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appReportSchedulesRelations = relations(
  appReportSchedules,
  ({ one, many }) => ({
    appReportInstances: many(appReportInstances),
    appUserTeam: one(appUserTeams, {
      fields: [appReportSchedules.teamId],
      references: [appUserTeams.id],
    }),
    appReportTemplate: one(appReportTemplates, {
      fields: [appReportSchedules.templateId],
      references: [appReportTemplates.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appReportSchedules.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appReportTemplatesRelations = relations(
  appReportTemplates,
  ({ one, many }) => ({
    appReportInstances: many(appReportInstances),
    appUserTeam: one(appUserTeams, {
      fields: [appReportTemplates.teamId],
      references: [appUserTeams.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appReportTemplates.userId],
      references: [appUserProfiles.id],
    }),
    appReportSchedules: many(appReportSchedules),
    appReportSubscriptions: many(appReportSubscriptions),
  })
);

export const appReportMetricsRelations = relations(
  appReportMetrics,
  ({ one }) => ({
    appUserTeam: one(appUserTeams, {
      fields: [appReportMetrics.teamId],
      references: [appUserTeams.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appReportMetrics.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appReportSubscriptionsRelations = relations(
  appReportSubscriptions,
  ({ one }) => ({
    appReportTemplate: one(appReportTemplates, {
      fields: [appReportSubscriptions.templateId],
      references: [appReportTemplates.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appReportSubscriptions.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appSettingsBackupsRelations = relations(
  appSettingsBackups,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appSettingsBackups.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appSettingsChangeLogsRelations = relations(
  appSettingsChangeLogs,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appSettingsChangeLogs.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appSettingsIntegrationsRelations = relations(
  appSettingsIntegrations,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appSettingsIntegrations.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appSettingsSecurityLogsRelations = relations(
  appSettingsSecurityLogs,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appSettingsSecurityLogs.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appSettingsThemePreferencesRelations = relations(
  appSettingsThemePreferences,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appSettingsThemePreferences.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appSettingsUserProfilesRelations = relations(
  appSettingsUserProfiles,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appSettingsUserProfiles.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appTeamActivityLogsRelations = relations(
  appTeamActivityLogs,
  ({ one }) => ({
    appUserTeam: one(appUserTeams, {
      fields: [appTeamActivityLogs.teamId],
      references: [appUserTeams.id],
    }),
    appUserProfile: one(appUserProfiles, {
      fields: [appTeamActivityLogs.userId],
      references: [appUserProfiles.id],
    }),
  })
);

export const appTeamCommunicationChannelsRelations = relations(
  appTeamCommunicationChannels,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appTeamCommunicationChannels.createdBy],
      references: [appUserProfiles.id],
    }),
    appUserTeam: one(appUserTeams, {
      fields: [appTeamCommunicationChannels.teamId],
      references: [appUserTeams.id],
    }),
  })
);

export const appTeamGoalsRelations = relations(appTeamGoals, ({ one }) => ({
  appUserProfile: one(appUserProfiles, {
    fields: [appTeamGoals.createdBy],
    references: [appUserProfiles.id],
  }),
  appUserTeam: one(appUserTeams, {
    fields: [appTeamGoals.teamId],
    references: [appUserTeams.id],
  }),
}));

export const appTeamMembersRelations = relations(appTeamMembers, ({ one }) => ({
  appUserProfile_invitedBy: one(appUserProfiles, {
    fields: [appTeamMembers.invitedBy],
    references: [appUserProfiles.id],
    relationName: 'appTeamMembers_invitedBy_appUserProfiles_id',
  }),
  appUserTeam: one(appUserTeams, {
    fields: [appTeamMembers.teamId],
    references: [appUserTeams.id],
  }),
  appUserProfile_userId: one(appUserProfiles, {
    fields: [appTeamMembers.userId],
    references: [appUserProfiles.id],
    relationName: 'appTeamMembers_userId_appUserProfiles_id',
  }),
}));

export const appTeamPerformanceMetricsRelations = relations(
  appTeamPerformanceMetrics,
  ({ one }) => ({
    appUserProfile: one(appUserProfiles, {
      fields: [appTeamPerformanceMetrics.memberId],
      references: [appUserProfiles.id],
    }),
    appUserTeam: one(appUserTeams, {
      fields: [appTeamPerformanceMetrics.teamId],
      references: [appUserTeams.id],
    }),
  })
);

export const appTeamStatsCacheRelations = relations(
  appTeamStatsCache,
  ({ one }) => ({
    appUserTeam: one(appUserTeams, {
      fields: [appTeamStatsCache.teamId],
      references: [appUserTeams.id],
    }),
  })
);

export const appTeamTrainingRecordsRelations = relations(
  appTeamTrainingRecords,
  ({ one }) => ({
    appUserProfile_memberId: one(appUserProfiles, {
      fields: [appTeamTrainingRecords.memberId],
      references: [appUserProfiles.id],
      relationName: 'appTeamTrainingRecords_memberId_appUserProfiles_id',
    }),
    appUserTeam: one(appUserTeams, {
      fields: [appTeamTrainingRecords.teamId],
      references: [appUserTeams.id],
    }),
    appUserProfile_trainerId: one(appUserProfiles, {
      fields: [appTeamTrainingRecords.trainerId],
      references: [appUserProfiles.id],
      relationName: 'appTeamTrainingRecords_trainerId_appUserProfiles_id',
    }),
  })
);
