import { relations } from "drizzle-orm/relations";
import { profiles, clients, pipelineStages, teams, clientDetails, usersInAuth, documents, insuranceInfo, invitations, meetings, referrals, calendarSettings, meetingAttendees, meetingNotes, meetingReminders, meetingTemplates, recurringMeetings, clientAnalytics, clientContactHistory, clientFamilyMembers, clientMilestones, clientPreferences, clientTagAssignments, clientTags, activityLogs, dashboardWidgets, goals, notifications, performanceMetrics, quickActions, influencerProfiles, gratitudeHistory, gratitudeTemplates, networkAnalysis, referralPatterns, invitationAnalytics, invitationCampaigns, invitationTemplates, invitationReferralTracking, invitationRewards, invitationUsageLogs, invitationWaitlist, networkAnalysisResults, networkConnections, networkNodes, networkEvents, networkInteractions, networkOpportunities, notificationQueue, notificationHistory, notificationTemplates, notificationRules, notificationSettings, notificationSubscriptions, pipelineAnalytics, pipelineAutomations, pipelineBottlenecks, pipelineGoals, pipelineViews, stageHistory, stageTemplates, reportDashboards, reportInstances, reportExports, reportSchedules, reportTemplates, reportMetrics, reportSubscriptions, apiKeys, auditLogs, backupConfigurations, featureFlags, integrations, systemSettings, teamSettings, userSettings, teamActivities, teamAnnouncements, teamCollaborations, teamGoals, teamKnowledgeBase, teamMembers, teamPerformance, teamTemplates, pageViews, faqs, publicContents, siteSettings, testimonials, announcements, meetingChecklists } from "./schema";

export const clientsRelations = relations(clients, ({one, many}) => ({
	profile: one(profiles, {
		fields: [clients.agentId],
		references: [profiles.id]
	}),
	pipelineStage: one(pipelineStages, {
		fields: [clients.currentStageId],
		references: [pipelineStages.id]
	}),
	client: one(clients, {
		fields: [clients.referredById],
		references: [clients.id],
		relationName: "clients_referredById_clients_id"
	}),
	clients: many(clients, {
		relationName: "clients_referredById_clients_id"
	}),
	team: one(teams, {
		fields: [clients.teamId],
		references: [teams.id]
	}),
	clientDetails: many(clientDetails),
	documents: many(documents),
	insuranceInfos: many(insuranceInfo),
	meetings: many(meetings),
	referrals_referredId: many(referrals, {
		relationName: "referrals_referredId_clients_id"
	}),
	referrals_referrerId: many(referrals, {
		relationName: "referrals_referrerId_clients_id"
	}),
	meetingAttendees: many(meetingAttendees),
	clientAnalytics: many(clientAnalytics),
	clientContactHistories: many(clientContactHistory),
	clientFamilyMembers: many(clientFamilyMembers),
	clientMilestones: many(clientMilestones),
	clientPreferences: many(clientPreferences),
	clientTagAssignments: many(clientTagAssignments),
	influencerProfiles: many(influencerProfiles),
	networkNodes: many(networkNodes),
	stageHistories: many(stageHistory),
}));

export const profilesRelations = relations(profiles, ({one, many}) => ({
	clients: many(clients),
	usersInAuth: one(usersInAuth, {
		fields: [profiles.id],
		references: [usersInAuth.id]
	}),
	teams: many(teams),
	pipelineStages: many(pipelineStages),
	documents: many(documents),
	invitations_inviterId: many(invitations, {
		relationName: "invitations_inviterId_profiles_id"
	}),
	invitations_usedById: many(invitations, {
		relationName: "invitations_usedById_profiles_id"
	}),
	meetings: many(meetings),
	referrals: many(referrals),
	calendarSettings: many(calendarSettings),
	meetingAttendees: many(meetingAttendees),
	meetingNotes: many(meetingNotes),
	meetingTemplates: many(meetingTemplates),
	clientContactHistories: many(clientContactHistory),
	clientMilestones: many(clientMilestones),
	clientTags: many(clientTags),
	activityLogs: many(activityLogs),
	dashboardWidgets: many(dashboardWidgets),
	goals: many(goals),
	notifications: many(notifications),
	performanceMetrics: many(performanceMetrics),
	quickActions: many(quickActions),
	influencerProfiles: many(influencerProfiles),
	gratitudeHistories: many(gratitudeHistory),
	gratitudeTemplates: many(gratitudeTemplates),
	networkAnalyses: many(networkAnalysis),
	referralPatterns: many(referralPatterns),
	invitationAnalytics: many(invitationAnalytics),
	invitationCampaigns: many(invitationCampaigns),
	invitationTemplates: many(invitationTemplates),
	invitationRewards_inviteeId: many(invitationRewards, {
		relationName: "invitationRewards_inviteeId_profiles_id"
	}),
	invitationRewards_inviterId: many(invitationRewards, {
		relationName: "invitationRewards_inviterId_profiles_id"
	}),
	invitationUsageLogs: many(invitationUsageLogs),
	invitationWaitlists: many(invitationWaitlist),
	networkAnalysisResults: many(networkAnalysisResults),
	networkConnections: many(networkConnections),
	networkNodes: many(networkNodes),
	networkEvents: many(networkEvents),
	networkInteractions: many(networkInteractions),
	networkOpportunities: many(networkOpportunities),
	notificationHistories: many(notificationHistory),
	notificationQueues: many(notificationQueue),
	notificationTemplates: many(notificationTemplates),
	notificationRules: many(notificationRules),
	notificationSettings: many(notificationSettings),
	notificationSubscriptions: many(notificationSubscriptions),
	pipelineAnalytics: many(pipelineAnalytics),
	pipelineAutomations: many(pipelineAutomations),
	pipelineBottlenecks: many(pipelineBottlenecks),
	pipelineGoals: many(pipelineGoals),
	pipelineViews: many(pipelineViews),
	stageHistories: many(stageHistory),
	stageTemplates: many(stageTemplates),
	reportDashboards: many(reportDashboards),
	reportExports: many(reportExports),
	reportInstances: many(reportInstances),
	reportTemplates: many(reportTemplates),
	reportSchedules: many(reportSchedules),
	reportMetrics: many(reportMetrics),
	reportSubscriptions: many(reportSubscriptions),
	apiKeys: many(apiKeys),
	auditLogs: many(auditLogs),
	backupConfigurations: many(backupConfigurations),
	featureFlags: many(featureFlags),
	integrations: many(integrations),
	systemSettings: many(systemSettings),
	teamSettings: many(teamSettings),
	userSettings: many(userSettings),
	teamActivities: many(teamActivities),
	teamAnnouncements: many(teamAnnouncements),
	teamCollaborations: many(teamCollaborations),
	teamGoals: many(teamGoals),
	teamKnowledgeBases: many(teamKnowledgeBase),
	teamMembers_invitedBy: many(teamMembers, {
		relationName: "teamMembers_invitedBy_profiles_id"
	}),
	teamMembers_userId: many(teamMembers, {
		relationName: "teamMembers_userId_profiles_id"
	}),
	teamPerformances: many(teamPerformance),
	teamTemplates: many(teamTemplates),
	pageViews: many(pageViews),
	faqs: many(faqs),
	publicContents: many(publicContents),
	siteSettings: many(siteSettings),
	testimonials: many(testimonials),
	announcements: many(announcements),
}));

export const pipelineStagesRelations = relations(pipelineStages, ({one, many}) => ({
	clients: many(clients),
	profile: one(profiles, {
		fields: [pipelineStages.agentId],
		references: [profiles.id]
	}),
	team: one(teams, {
		fields: [pipelineStages.teamId],
		references: [teams.id]
	}),
	pipelineAnalytics: many(pipelineAnalytics),
	pipelineAutomations: many(pipelineAutomations),
	pipelineBottlenecks: many(pipelineBottlenecks),
	pipelineGoals: many(pipelineGoals),
	stageHistories_fromStageId: many(stageHistory, {
		relationName: "stageHistory_fromStageId_pipelineStages_id"
	}),
	stageHistories_toStageId: many(stageHistory, {
		relationName: "stageHistory_toStageId_pipelineStages_id"
	}),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	clients: many(clients),
	profile: one(profiles, {
		fields: [teams.adminId],
		references: [profiles.id]
	}),
	pipelineStages: many(pipelineStages),
	goals: many(goals),
	performanceMetrics: many(performanceMetrics),
	gratitudeTemplates: many(gratitudeTemplates),
	networkAnalyses: many(networkAnalysis),
	invitationAnalytics: many(invitationAnalytics),
	invitationCampaigns: many(invitationCampaigns),
	invitationTemplates: many(invitationTemplates),
	networkAnalysisResults: many(networkAnalysisResults),
	networkEvents: many(networkEvents),
	notificationTemplates: many(notificationTemplates),
	notificationRules: many(notificationRules),
	pipelineAnalytics: many(pipelineAnalytics),
	pipelineAutomations: many(pipelineAutomations),
	pipelineBottlenecks: many(pipelineBottlenecks),
	pipelineGoals: many(pipelineGoals),
	pipelineViews: many(pipelineViews),
	stageTemplates: many(stageTemplates),
	reportDashboards: many(reportDashboards),
	reportTemplates: many(reportTemplates),
	reportSchedules: many(reportSchedules),
	reportMetrics: many(reportMetrics),
	apiKeys: many(apiKeys),
	auditLogs: many(auditLogs),
	backupConfigurations: many(backupConfigurations),
	integrations: many(integrations),
	teamSettings: many(teamSettings),
	teamActivities: many(teamActivities),
	teamAnnouncements: many(teamAnnouncements),
	teamCollaborations: many(teamCollaborations),
	teamGoals: many(teamGoals),
	teamKnowledgeBases: many(teamKnowledgeBase),
	teamMembers: many(teamMembers),
	teamPerformances: many(teamPerformance),
	teamTemplates: many(teamTemplates),
}));

export const clientDetailsRelations = relations(clientDetails, ({one}) => ({
	client: one(clients, {
		fields: [clientDetails.clientId],
		references: [clients.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	profiles: many(profiles),
}));

export const documentsRelations = relations(documents, ({one}) => ({
	profile: one(profiles, {
		fields: [documents.agentId],
		references: [profiles.id]
	}),
	client: one(clients, {
		fields: [documents.clientId],
		references: [clients.id]
	}),
	insuranceInfo: one(insuranceInfo, {
		fields: [documents.insuranceInfoId],
		references: [insuranceInfo.id]
	}),
}));

export const insuranceInfoRelations = relations(insuranceInfo, ({one, many}) => ({
	documents: many(documents),
	client: one(clients, {
		fields: [insuranceInfo.clientId],
		references: [clients.id]
	}),
}));

export const invitationsRelations = relations(invitations, ({one, many}) => ({
	profile_inviterId: one(profiles, {
		fields: [invitations.inviterId],
		references: [profiles.id],
		relationName: "invitations_inviterId_profiles_id"
	}),
	profile_usedById: one(profiles, {
		fields: [invitations.usedById],
		references: [profiles.id],
		relationName: "invitations_usedById_profiles_id"
	}),
	invitationReferralTrackings: many(invitationReferralTracking),
	invitationRewards: many(invitationRewards),
	invitationUsageLogs: many(invitationUsageLogs),
	invitationWaitlists: many(invitationWaitlist),
}));

export const meetingsRelations = relations(meetings, ({one, many}) => ({
	profile: one(profiles, {
		fields: [meetings.agentId],
		references: [profiles.id]
	}),
	client: one(clients, {
		fields: [meetings.clientId],
		references: [clients.id]
	}),
	meetingAttendees: many(meetingAttendees),
	meetingNotes: many(meetingNotes),
	meetingReminders: many(meetingReminders),
	recurringMeetings: many(recurringMeetings),
	meetingChecklists: many(meetingChecklists),
}));

export const referralsRelations = relations(referrals, ({one}) => ({
	profile: one(profiles, {
		fields: [referrals.agentId],
		references: [profiles.id]
	}),
	client_referredId: one(clients, {
		fields: [referrals.referredId],
		references: [clients.id],
		relationName: "referrals_referredId_clients_id"
	}),
	client_referrerId: one(clients, {
		fields: [referrals.referrerId],
		references: [clients.id],
		relationName: "referrals_referrerId_clients_id"
	}),
}));

export const calendarSettingsRelations = relations(calendarSettings, ({one}) => ({
	profile: one(profiles, {
		fields: [calendarSettings.agentId],
		references: [profiles.id]
	}),
}));

export const meetingAttendeesRelations = relations(meetingAttendees, ({one}) => ({
	profile: one(profiles, {
		fields: [meetingAttendees.agentId],
		references: [profiles.id]
	}),
	client: one(clients, {
		fields: [meetingAttendees.clientId],
		references: [clients.id]
	}),
	meeting: one(meetings, {
		fields: [meetingAttendees.meetingId],
		references: [meetings.id]
	}),
}));

export const meetingNotesRelations = relations(meetingNotes, ({one}) => ({
	profile: one(profiles, {
		fields: [meetingNotes.agentId],
		references: [profiles.id]
	}),
	meeting: one(meetings, {
		fields: [meetingNotes.meetingId],
		references: [meetings.id]
	}),
}));

export const meetingRemindersRelations = relations(meetingReminders, ({one}) => ({
	meeting: one(meetings, {
		fields: [meetingReminders.meetingId],
		references: [meetings.id]
	}),
}));

export const meetingTemplatesRelations = relations(meetingTemplates, ({one}) => ({
	profile: one(profiles, {
		fields: [meetingTemplates.agentId],
		references: [profiles.id]
	}),
}));

export const recurringMeetingsRelations = relations(recurringMeetings, ({one}) => ({
	meeting: one(meetings, {
		fields: [recurringMeetings.parentMeetingId],
		references: [meetings.id]
	}),
}));

export const clientAnalyticsRelations = relations(clientAnalytics, ({one}) => ({
	client: one(clients, {
		fields: [clientAnalytics.clientId],
		references: [clients.id]
	}),
}));

export const clientContactHistoryRelations = relations(clientContactHistory, ({one}) => ({
	profile: one(profiles, {
		fields: [clientContactHistory.agentId],
		references: [profiles.id]
	}),
	client: one(clients, {
		fields: [clientContactHistory.clientId],
		references: [clients.id]
	}),
}));

export const clientFamilyMembersRelations = relations(clientFamilyMembers, ({one}) => ({
	client: one(clients, {
		fields: [clientFamilyMembers.clientId],
		references: [clients.id]
	}),
}));

export const clientMilestonesRelations = relations(clientMilestones, ({one}) => ({
	profile: one(profiles, {
		fields: [clientMilestones.agentId],
		references: [profiles.id]
	}),
	client: one(clients, {
		fields: [clientMilestones.clientId],
		references: [clients.id]
	}),
}));

export const clientPreferencesRelations = relations(clientPreferences, ({one}) => ({
	client: one(clients, {
		fields: [clientPreferences.clientId],
		references: [clients.id]
	}),
}));

export const clientTagAssignmentsRelations = relations(clientTagAssignments, ({one}) => ({
	client: one(clients, {
		fields: [clientTagAssignments.clientId],
		references: [clients.id]
	}),
	clientTag: one(clientTags, {
		fields: [clientTagAssignments.tagId],
		references: [clientTags.id]
	}),
}));

export const clientTagsRelations = relations(clientTags, ({one, many}) => ({
	clientTagAssignments: many(clientTagAssignments),
	profile: one(profiles, {
		fields: [clientTags.agentId],
		references: [profiles.id]
	}),
}));

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	profile: one(profiles, {
		fields: [activityLogs.userId],
		references: [profiles.id]
	}),
}));

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({one}) => ({
	profile: one(profiles, {
		fields: [dashboardWidgets.userId],
		references: [profiles.id]
	}),
}));

export const goalsRelations = relations(goals, ({one}) => ({
	profile: one(profiles, {
		fields: [goals.agentId],
		references: [profiles.id]
	}),
	team: one(teams, {
		fields: [goals.teamId],
		references: [teams.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	profile: one(profiles, {
		fields: [notifications.userId],
		references: [profiles.id]
	}),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({one}) => ({
	profile: one(profiles, {
		fields: [performanceMetrics.agentId],
		references: [profiles.id]
	}),
	team: one(teams, {
		fields: [performanceMetrics.teamId],
		references: [teams.id]
	}),
}));

export const quickActionsRelations = relations(quickActions, ({one}) => ({
	profile: one(profiles, {
		fields: [quickActions.userId],
		references: [profiles.id]
	}),
}));

export const influencerProfilesRelations = relations(influencerProfiles, ({one, many}) => ({
	profile: one(profiles, {
		fields: [influencerProfiles.agentId],
		references: [profiles.id]
	}),
	client: one(clients, {
		fields: [influencerProfiles.clientId],
		references: [clients.id]
	}),
	gratitudeHistories: many(gratitudeHistory),
	referralPatterns: many(referralPatterns),
}));

export const gratitudeHistoryRelations = relations(gratitudeHistory, ({one}) => ({
	profile: one(profiles, {
		fields: [gratitudeHistory.agentId],
		references: [profiles.id]
	}),
	influencerProfile: one(influencerProfiles, {
		fields: [gratitudeHistory.influencerId],
		references: [influencerProfiles.id]
	}),
}));

export const gratitudeTemplatesRelations = relations(gratitudeTemplates, ({one}) => ({
	profile: one(profiles, {
		fields: [gratitudeTemplates.agentId],
		references: [profiles.id]
	}),
	team: one(teams, {
		fields: [gratitudeTemplates.teamId],
		references: [teams.id]
	}),
}));

export const networkAnalysisRelations = relations(networkAnalysis, ({one}) => ({
	profile: one(profiles, {
		fields: [networkAnalysis.agentId],
		references: [profiles.id]
	}),
	team: one(teams, {
		fields: [networkAnalysis.teamId],
		references: [teams.id]
	}),
}));

export const referralPatternsRelations = relations(referralPatterns, ({one}) => ({
	profile: one(profiles, {
		fields: [referralPatterns.agentId],
		references: [profiles.id]
	}),
	influencerProfile: one(influencerProfiles, {
		fields: [referralPatterns.influencerId],
		references: [influencerProfiles.id]
	}),
}));

export const invitationAnalyticsRelations = relations(invitationAnalytics, ({one}) => ({
	team: one(teams, {
		fields: [invitationAnalytics.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [invitationAnalytics.userId],
		references: [profiles.id]
	}),
}));

export const invitationCampaignsRelations = relations(invitationCampaigns, ({one}) => ({
	team: one(teams, {
		fields: [invitationCampaigns.teamId],
		references: [teams.id]
	}),
	invitationTemplate: one(invitationTemplates, {
		fields: [invitationCampaigns.templateId],
		references: [invitationTemplates.id]
	}),
	profile: one(profiles, {
		fields: [invitationCampaigns.userId],
		references: [profiles.id]
	}),
}));

export const invitationTemplatesRelations = relations(invitationTemplates, ({one, many}) => ({
	invitationCampaigns: many(invitationCampaigns),
	team: one(teams, {
		fields: [invitationTemplates.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [invitationTemplates.userId],
		references: [profiles.id]
	}),
}));

export const invitationReferralTrackingRelations = relations(invitationReferralTracking, ({one}) => ({
	invitation: one(invitations, {
		fields: [invitationReferralTracking.invitationId],
		references: [invitations.id]
	}),
}));

export const invitationRewardsRelations = relations(invitationRewards, ({one}) => ({
	invitation: one(invitations, {
		fields: [invitationRewards.invitationId],
		references: [invitations.id]
	}),
	profile_inviteeId: one(profiles, {
		fields: [invitationRewards.inviteeId],
		references: [profiles.id],
		relationName: "invitationRewards_inviteeId_profiles_id"
	}),
	profile_inviterId: one(profiles, {
		fields: [invitationRewards.inviterId],
		references: [profiles.id],
		relationName: "invitationRewards_inviterId_profiles_id"
	}),
}));

export const invitationUsageLogsRelations = relations(invitationUsageLogs, ({one}) => ({
	invitation: one(invitations, {
		fields: [invitationUsageLogs.invitationId],
		references: [invitations.id]
	}),
	profile: one(profiles, {
		fields: [invitationUsageLogs.userId],
		references: [profiles.id]
	}),
}));

export const invitationWaitlistRelations = relations(invitationWaitlist, ({one}) => ({
	invitation: one(invitations, {
		fields: [invitationWaitlist.invitationId],
		references: [invitations.id]
	}),
	profile: one(profiles, {
		fields: [invitationWaitlist.registeredUserId],
		references: [profiles.id]
	}),
}));

export const networkAnalysisResultsRelations = relations(networkAnalysisResults, ({one}) => ({
	profile: one(profiles, {
		fields: [networkAnalysisResults.agentId],
		references: [profiles.id]
	}),
	team: one(teams, {
		fields: [networkAnalysisResults.teamId],
		references: [teams.id]
	}),
}));

export const networkConnectionsRelations = relations(networkConnections, ({one, many}) => ({
	profile: one(profiles, {
		fields: [networkConnections.agentId],
		references: [profiles.id]
	}),
	networkNode_sourceNodeId: one(networkNodes, {
		fields: [networkConnections.sourceNodeId],
		references: [networkNodes.id],
		relationName: "networkConnections_sourceNodeId_networkNodes_id"
	}),
	networkNode_targetNodeId: one(networkNodes, {
		fields: [networkConnections.targetNodeId],
		references: [networkNodes.id],
		relationName: "networkConnections_targetNodeId_networkNodes_id"
	}),
	networkInteractions: many(networkInteractions),
}));

export const networkNodesRelations = relations(networkNodes, ({one, many}) => ({
	networkConnections_sourceNodeId: many(networkConnections, {
		relationName: "networkConnections_sourceNodeId_networkNodes_id"
	}),
	networkConnections_targetNodeId: many(networkConnections, {
		relationName: "networkConnections_targetNodeId_networkNodes_id"
	}),
	profile: one(profiles, {
		fields: [networkNodes.agentId],
		references: [profiles.id]
	}),
	client: one(clients, {
		fields: [networkNodes.clientId],
		references: [clients.id]
	}),
	networkOpportunities_sourceNodeId: many(networkOpportunities, {
		relationName: "networkOpportunities_sourceNodeId_networkNodes_id"
	}),
	networkOpportunities_targetNodeId: many(networkOpportunities, {
		relationName: "networkOpportunities_targetNodeId_networkNodes_id"
	}),
}));

export const networkEventsRelations = relations(networkEvents, ({one}) => ({
	profile: one(profiles, {
		fields: [networkEvents.agentId],
		references: [profiles.id]
	}),
	team: one(teams, {
		fields: [networkEvents.teamId],
		references: [teams.id]
	}),
}));

export const networkInteractionsRelations = relations(networkInteractions, ({one}) => ({
	profile: one(profiles, {
		fields: [networkInteractions.agentId],
		references: [profiles.id]
	}),
	networkConnection: one(networkConnections, {
		fields: [networkInteractions.connectionId],
		references: [networkConnections.id]
	}),
}));

export const networkOpportunitiesRelations = relations(networkOpportunities, ({one}) => ({
	profile: one(profiles, {
		fields: [networkOpportunities.agentId],
		references: [profiles.id]
	}),
	networkNode_sourceNodeId: one(networkNodes, {
		fields: [networkOpportunities.sourceNodeId],
		references: [networkNodes.id],
		relationName: "networkOpportunities_sourceNodeId_networkNodes_id"
	}),
	networkNode_targetNodeId: one(networkNodes, {
		fields: [networkOpportunities.targetNodeId],
		references: [networkNodes.id],
		relationName: "networkOpportunities_targetNodeId_networkNodes_id"
	}),
}));

export const notificationHistoryRelations = relations(notificationHistory, ({one}) => ({
	notificationQueue: one(notificationQueue, {
		fields: [notificationHistory.queueId],
		references: [notificationQueue.id]
	}),
	profile: one(profiles, {
		fields: [notificationHistory.userId],
		references: [profiles.id]
	}),
}));

export const notificationQueueRelations = relations(notificationQueue, ({one, many}) => ({
	notificationHistories: many(notificationHistory),
	notificationTemplate: one(notificationTemplates, {
		fields: [notificationQueue.templateId],
		references: [notificationTemplates.id]
	}),
	profile: one(profiles, {
		fields: [notificationQueue.userId],
		references: [profiles.id]
	}),
}));

export const notificationTemplatesRelations = relations(notificationTemplates, ({one, many}) => ({
	notificationQueues: many(notificationQueue),
	team: one(teams, {
		fields: [notificationTemplates.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [notificationTemplates.userId],
		references: [profiles.id]
	}),
}));

export const notificationRulesRelations = relations(notificationRules, ({one}) => ({
	team: one(teams, {
		fields: [notificationRules.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [notificationRules.userId],
		references: [profiles.id]
	}),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({one}) => ({
	profile: one(profiles, {
		fields: [notificationSettings.userId],
		references: [profiles.id]
	}),
}));

export const notificationSubscriptionsRelations = relations(notificationSubscriptions, ({one}) => ({
	profile: one(profiles, {
		fields: [notificationSubscriptions.userId],
		references: [profiles.id]
	}),
}));

export const pipelineAnalyticsRelations = relations(pipelineAnalytics, ({one}) => ({
	pipelineStage: one(pipelineStages, {
		fields: [pipelineAnalytics.stageId],
		references: [pipelineStages.id]
	}),
	team: one(teams, {
		fields: [pipelineAnalytics.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [pipelineAnalytics.userId],
		references: [profiles.id]
	}),
}));

export const pipelineAutomationsRelations = relations(pipelineAutomations, ({one}) => ({
	pipelineStage: one(pipelineStages, {
		fields: [pipelineAutomations.stageId],
		references: [pipelineStages.id]
	}),
	team: one(teams, {
		fields: [pipelineAutomations.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [pipelineAutomations.userId],
		references: [profiles.id]
	}),
}));

export const pipelineBottlenecksRelations = relations(pipelineBottlenecks, ({one}) => ({
	pipelineStage: one(pipelineStages, {
		fields: [pipelineBottlenecks.stageId],
		references: [pipelineStages.id]
	}),
	team: one(teams, {
		fields: [pipelineBottlenecks.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [pipelineBottlenecks.userId],
		references: [profiles.id]
	}),
}));

export const pipelineGoalsRelations = relations(pipelineGoals, ({one}) => ({
	pipelineStage: one(pipelineStages, {
		fields: [pipelineGoals.stageId],
		references: [pipelineStages.id]
	}),
	team: one(teams, {
		fields: [pipelineGoals.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [pipelineGoals.userId],
		references: [profiles.id]
	}),
}));

export const pipelineViewsRelations = relations(pipelineViews, ({one}) => ({
	team: one(teams, {
		fields: [pipelineViews.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [pipelineViews.userId],
		references: [profiles.id]
	}),
}));

export const stageHistoryRelations = relations(stageHistory, ({one}) => ({
	profile: one(profiles, {
		fields: [stageHistory.changedBy],
		references: [profiles.id]
	}),
	client: one(clients, {
		fields: [stageHistory.clientId],
		references: [clients.id]
	}),
	pipelineStage_fromStageId: one(pipelineStages, {
		fields: [stageHistory.fromStageId],
		references: [pipelineStages.id],
		relationName: "stageHistory_fromStageId_pipelineStages_id"
	}),
	pipelineStage_toStageId: one(pipelineStages, {
		fields: [stageHistory.toStageId],
		references: [pipelineStages.id],
		relationName: "stageHistory_toStageId_pipelineStages_id"
	}),
}));

export const stageTemplatesRelations = relations(stageTemplates, ({one}) => ({
	team: one(teams, {
		fields: [stageTemplates.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [stageTemplates.userId],
		references: [profiles.id]
	}),
}));

export const reportDashboardsRelations = relations(reportDashboards, ({one}) => ({
	team: one(teams, {
		fields: [reportDashboards.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [reportDashboards.userId],
		references: [profiles.id]
	}),
}));

export const reportExportsRelations = relations(reportExports, ({one}) => ({
	reportInstance: one(reportInstances, {
		fields: [reportExports.reportInstanceId],
		references: [reportInstances.id]
	}),
	profile: one(profiles, {
		fields: [reportExports.userId],
		references: [profiles.id]
	}),
}));

export const reportInstancesRelations = relations(reportInstances, ({one, many}) => ({
	reportExports: many(reportExports),
	reportSchedule: one(reportSchedules, {
		fields: [reportInstances.scheduleId],
		references: [reportSchedules.id]
	}),
	reportTemplate: one(reportTemplates, {
		fields: [reportInstances.templateId],
		references: [reportTemplates.id]
	}),
	profile: one(profiles, {
		fields: [reportInstances.userId],
		references: [profiles.id]
	}),
}));

export const reportSchedulesRelations = relations(reportSchedules, ({one, many}) => ({
	reportInstances: many(reportInstances),
	team: one(teams, {
		fields: [reportSchedules.teamId],
		references: [teams.id]
	}),
	reportTemplate: one(reportTemplates, {
		fields: [reportSchedules.templateId],
		references: [reportTemplates.id]
	}),
	profile: one(profiles, {
		fields: [reportSchedules.userId],
		references: [profiles.id]
	}),
}));

export const reportTemplatesRelations = relations(reportTemplates, ({one, many}) => ({
	reportInstances: many(reportInstances),
	team: one(teams, {
		fields: [reportTemplates.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [reportTemplates.userId],
		references: [profiles.id]
	}),
	reportSchedules: many(reportSchedules),
	reportSubscriptions: many(reportSubscriptions),
}));

export const reportMetricsRelations = relations(reportMetrics, ({one}) => ({
	team: one(teams, {
		fields: [reportMetrics.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [reportMetrics.userId],
		references: [profiles.id]
	}),
}));

export const reportSubscriptionsRelations = relations(reportSubscriptions, ({one}) => ({
	reportTemplate: one(reportTemplates, {
		fields: [reportSubscriptions.templateId],
		references: [reportTemplates.id]
	}),
	profile: one(profiles, {
		fields: [reportSubscriptions.userId],
		references: [profiles.id]
	}),
}));

export const apiKeysRelations = relations(apiKeys, ({one}) => ({
	team: one(teams, {
		fields: [apiKeys.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [apiKeys.userId],
		references: [profiles.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	team: one(teams, {
		fields: [auditLogs.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [auditLogs.userId],
		references: [profiles.id]
	}),
}));

export const backupConfigurationsRelations = relations(backupConfigurations, ({one}) => ({
	team: one(teams, {
		fields: [backupConfigurations.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [backupConfigurations.userId],
		references: [profiles.id]
	}),
}));

export const featureFlagsRelations = relations(featureFlags, ({one}) => ({
	profile: one(profiles, {
		fields: [featureFlags.createdBy],
		references: [profiles.id]
	}),
}));

export const integrationsRelations = relations(integrations, ({one}) => ({
	team: one(teams, {
		fields: [integrations.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [integrations.userId],
		references: [profiles.id]
	}),
}));

export const systemSettingsRelations = relations(systemSettings, ({one}) => ({
	profile: one(profiles, {
		fields: [systemSettings.updatedBy],
		references: [profiles.id]
	}),
}));

export const teamSettingsRelations = relations(teamSettings, ({one}) => ({
	team: one(teams, {
		fields: [teamSettings.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [teamSettings.updatedBy],
		references: [profiles.id]
	}),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	profile: one(profiles, {
		fields: [userSettings.userId],
		references: [profiles.id]
	}),
}));

export const teamActivitiesRelations = relations(teamActivities, ({one}) => ({
	team: one(teams, {
		fields: [teamActivities.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [teamActivities.userId],
		references: [profiles.id]
	}),
}));

export const teamAnnouncementsRelations = relations(teamAnnouncements, ({one}) => ({
	profile: one(profiles, {
		fields: [teamAnnouncements.authorId],
		references: [profiles.id]
	}),
	team: one(teams, {
		fields: [teamAnnouncements.teamId],
		references: [teams.id]
	}),
}));

export const teamCollaborationsRelations = relations(teamCollaborations, ({one}) => ({
	profile: one(profiles, {
		fields: [teamCollaborations.initiatedBy],
		references: [profiles.id]
	}),
	team: one(teams, {
		fields: [teamCollaborations.teamId],
		references: [teams.id]
	}),
}));

export const teamGoalsRelations = relations(teamGoals, ({one}) => ({
	profile: one(profiles, {
		fields: [teamGoals.createdBy],
		references: [profiles.id]
	}),
	team: one(teams, {
		fields: [teamGoals.teamId],
		references: [teams.id]
	}),
}));

export const teamKnowledgeBaseRelations = relations(teamKnowledgeBase, ({one}) => ({
	profile: one(profiles, {
		fields: [teamKnowledgeBase.authorId],
		references: [profiles.id]
	}),
	team: one(teams, {
		fields: [teamKnowledgeBase.teamId],
		references: [teams.id]
	}),
}));

export const teamMembersRelations = relations(teamMembers, ({one}) => ({
	profile_invitedBy: one(profiles, {
		fields: [teamMembers.invitedBy],
		references: [profiles.id],
		relationName: "teamMembers_invitedBy_profiles_id"
	}),
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id]
	}),
	profile_userId: one(profiles, {
		fields: [teamMembers.userId],
		references: [profiles.id],
		relationName: "teamMembers_userId_profiles_id"
	}),
}));

export const teamPerformanceRelations = relations(teamPerformance, ({one}) => ({
	team: one(teams, {
		fields: [teamPerformance.teamId],
		references: [teams.id]
	}),
	profile: one(profiles, {
		fields: [teamPerformance.topPerformerId],
		references: [profiles.id]
	}),
}));

export const teamTemplatesRelations = relations(teamTemplates, ({one}) => ({
	profile: one(profiles, {
		fields: [teamTemplates.createdBy],
		references: [profiles.id]
	}),
	team: one(teams, {
		fields: [teamTemplates.teamId],
		references: [teams.id]
	}),
}));

export const pageViewsRelations = relations(pageViews, ({one}) => ({
	profile: one(profiles, {
		fields: [pageViews.userId],
		references: [profiles.id]
	}),
}));

export const faqsRelations = relations(faqs, ({one}) => ({
	profile: one(profiles, {
		fields: [faqs.authorId],
		references: [profiles.id]
	}),
}));

export const publicContentsRelations = relations(publicContents, ({one}) => ({
	profile: one(profiles, {
		fields: [publicContents.authorId],
		references: [profiles.id]
	}),
}));

export const siteSettingsRelations = relations(siteSettings, ({one}) => ({
	profile: one(profiles, {
		fields: [siteSettings.updatedBy],
		references: [profiles.id]
	}),
}));

export const testimonialsRelations = relations(testimonials, ({one}) => ({
	profile: one(profiles, {
		fields: [testimonials.authorId],
		references: [profiles.id]
	}),
}));

export const announcementsRelations = relations(announcements, ({one}) => ({
	profile: one(profiles, {
		fields: [announcements.authorId],
		references: [profiles.id]
	}),
}));

export const meetingChecklistsRelations = relations(meetingChecklists, ({one}) => ({
	meeting: one(meetings, {
		fields: [meetingChecklists.meetingId],
		references: [meetings.id]
	}),
}));