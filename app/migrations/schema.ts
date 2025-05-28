import { pgTable, foreignKey, uuid, text, boolean, integer, jsonb, timestamp, unique, date, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const activityType = pgEnum("activity_type", ['client_added', 'client_updated', 'meeting_scheduled', 'meeting_completed', 'meeting_cancelled', 'referral_received', 'referral_converted', 'goal_achieved', 'stage_changed', 'document_uploaded', 'insurance_added'])
export const auditAction = pgEnum("audit_action", ['create', 'update', 'delete', 'login', 'logout', 'export', 'import', 'share', 'invite'])
export const automationAction = pgEnum("automation_action", ['send_notification', 'create_task', 'schedule_meeting', 'move_to_stage', 'assign_to_user', 'send_email'])
export const automationTrigger = pgEnum("automation_trigger", ['stage_entry', 'stage_exit', 'time_in_stage', 'client_created', 'meeting_scheduled', 'document_uploaded'])
export const calendarView = pgEnum("calendar_view", ['month', 'week', 'day', 'agenda'])
export const chartType = pgEnum("chart_type", ['line', 'bar', 'pie', 'doughnut', 'area', 'scatter', 'funnel', 'gauge'])
export const clientSource = pgEnum("client_source", ['referral', 'cold_call', 'marketing', 'website', 'social_media', 'event', 'partner', 'other'])
export const clientStatus = pgEnum("client_status", ['prospect', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'closed_won', 'closed_lost', 'dormant'])
export const collaborationType = pgEnum("collaboration_type", ['shared_client', 'joint_meeting', 'referral_handoff', 'knowledge_share', 'peer_review'])
export const connectionType = pgEnum("connection_type", ['direct_referral', 'family_member', 'colleague', 'friend', 'business_partner', 'community_member'])
export const contactMethod = pgEnum("contact_method", ['phone', 'email', 'kakao', 'sms', 'in_person', 'video_call'])
export const contentStatus = pgEnum("content_status", ['draft', 'published', 'archived'])
export const contentType = pgEnum("content_type", ['terms_of_service', 'privacy_policy', 'faq', 'announcement', 'help_article'])
export const documentType = pgEnum("document_type", ['policy', 'id_card', 'vehicle_registration', 'vehicle_photo', 'dashboard_photo', 'license_plate_photo', 'blackbox_photo', 'insurance_policy_photo', 'other'])
export const gender = pgEnum("gender", ['male', 'female'])
export const giftType = pgEnum("gift_type", ['flowers', 'fruit_basket', 'gift_card', 'meal_voucher', 'coffee_voucher', 'custom_gift', 'none'])
export const goalPeriod = pgEnum("goal_period", ['monthly', 'quarterly', 'yearly'])
export const goalType = pgEnum("goal_type", ['clients', 'meetings', 'revenue', 'referrals', 'conversion_rate'])
export const gratitudeStatus = pgEnum("gratitude_status", ['planned', 'scheduled', 'sent', 'delivered', 'completed', 'cancelled'])
export const gratitudeType = pgEnum("gratitude_type", ['thank_you_call', 'thank_you_message', 'gift_delivery', 'meal_invitation', 'event_invitation', 'custom'])
export const importance = pgEnum("importance", ['high', 'medium', 'low'])
export const influencerTier = pgEnum("influencer_tier", ['bronze', 'silver', 'gold', 'platinum', 'diamond'])
export const insuranceType = pgEnum("insurance_type", ['life', 'health', 'auto', 'prenatal', 'property', 'other'])
export const integrationStatus = pgEnum("integration_status", ['active', 'inactive', 'error', 'pending', 'expired'])
export const integrationType = pgEnum("integration_type", ['google_calendar', 'kakao_talk', 'slack', 'email', 'sms', 'webhook', 'api'])
export const invitationSource = pgEnum("invitation_source", ['direct_link', 'email', 'sms', 'kakao_talk', 'qr_code', 'referral_bonus'])
export const invitationStatus = pgEnum("invitation_status", ['pending', 'used', 'expired', 'cancelled'])
export const invitationType = pgEnum("invitation_type", ['standard', 'premium', 'team_admin', 'beta_tester'])
export const language = pgEnum("language", ['ko', 'en', 'ja', 'zh'])
export const meetingStatus = pgEnum("meeting_status", ['scheduled', 'completed', 'cancelled', 'rescheduled'])
export const meetingType = pgEnum("meeting_type", ['first_consultation', 'product_explanation', 'contract_review', 'follow_up', 'other'])
export const memberRole = pgEnum("member_role", ['member', 'admin', 'owner', 'viewer'])
export const memberStatus = pgEnum("member_status", ['active', 'inactive', 'pending', 'suspended'])
export const metricPeriod = pgEnum("metric_period", ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
export const networkAnalysisType = pgEnum("network_analysis_type", ['centrality', 'clustering', 'path_analysis', 'influence_mapping', 'growth_tracking'])
export const networkNodeType = pgEnum("network_node_type", ['client', 'prospect', 'influencer', 'partner', 'external'])
export const notificationChannel = pgEnum("notification_channel", ['in_app', 'email', 'sms', 'push', 'kakao'])
export const notificationPriority = pgEnum("notification_priority", ['low', 'normal', 'high', 'urgent'])
export const notificationStatus = pgEnum("notification_status", ['pending', 'sent', 'delivered', 'read', 'failed', 'cancelled'])
export const notificationType = pgEnum("notification_type", ['meeting_reminder', 'goal_achievement', 'goal_deadline', 'new_referral', 'client_milestone', 'team_update', 'system_alert', 'birthday_reminder', 'follow_up_reminder', 'contract_expiry', 'payment_due'])
export const pipelineViewType = pgEnum("pipeline_view_type", ['kanban', 'list', 'table', 'timeline', 'funnel'])
export const recurrenceType = pgEnum("recurrence_type", ['none', 'daily', 'weekly', 'monthly', 'yearly'])
export const referralStatus = pgEnum("referral_status", ['active', 'inactive'])
export const reminderType = pgEnum("reminder_type", ['none', '5_minutes', '15_minutes', '30_minutes', '1_hour', '1_day'])
export const reportFormat = pgEnum("report_format", ['pdf', 'excel', 'csv', 'json', 'html'])
export const reportFrequency = pgEnum("report_frequency", ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'on_demand'])
export const reportStatus = pgEnum("report_status", ['pending', 'generating', 'completed', 'failed', 'cancelled'])
export const reportType = pgEnum("report_type", ['performance', 'pipeline', 'client_analysis', 'referral_analysis', 'meeting_analysis', 'revenue', 'conversion', 'activity', 'custom'])
export const settingCategory = pgEnum("setting_category", ['general', 'notifications', 'privacy', 'security', 'integrations', 'appearance', 'billing', 'team'])
export const settingType = pgEnum("setting_type", ['boolean', 'string', 'number', 'json', 'array', 'enum'])
export const stageActionType = pgEnum("stage_action_type", ['moved_to_stage', 'stage_created', 'stage_updated', 'stage_deleted', 'bulk_move', 'automation_triggered'])
export const teamEventType = pgEnum("team_event_type", ['member_joined', 'member_left', 'member_promoted', 'member_demoted', 'settings_changed', 'goal_created', 'goal_achieved', 'milestone_reached'])
export const usageAction = pgEnum("usage_action", ['viewed', 'clicked', 'registered', 'completed'])
export const userRole = pgEnum("user_role", ['agent', 'team_admin', 'system_admin'])
export const waitlistStatus = pgEnum("waitlist_status", ['waiting', 'invited', 'registered', 'rejected'])


export const clients = pgTable("clients", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	teamId: uuid("team_id"),
	fullName: text("full_name").notNull(),
	email: text(),
	phone: text().notNull(),
	telecomProvider: text("telecom_provider"),
	address: text(),
	occupation: text(),
	hasDrivingLicense: boolean("has_driving_license"),
	height: integer(),
	weight: integer(),
	tags: text().array(),
	importance: importance().default('medium').notNull(),
	currentStageId: uuid("current_stage_id").notNull(),
	referredById: uuid("referred_by_id"),
	notes: text(),
	customFields: jsonb("custom_fields"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "clients_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.currentStageId],
			foreignColumns: [pipelineStages.id],
			name: "clients_current_stage_id_pipeline_stages_id_fk"
		}),
	foreignKey({
			columns: [table.referredById],
			foreignColumns: [table.id],
			name: "clients_referred_by_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "clients_team_id_teams_id_fk"
		}),
]);

export const clientDetails = pgTable("client_details", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	ssn: text(),
	birthDate: date("birth_date"),
	gender: gender(),
	consentDate: timestamp("consent_date", { withTimezone: true, mode: 'string' }),
	consentDetails: jsonb("consent_details"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_details_client_id_clients_id_fk"
		}).onDelete("cascade"),
	unique("client_details_client_id_unique").on(table.clientId),
]);

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	fullName: text("full_name").notNull(),
	phone: text(),
	profileImageUrl: text("profile_image_url"),
	company: text(),
	role: userRole().default('agent').notNull(),
	teamId: uuid("team_id"),
	invitedById: uuid("invited_by_id"),
	invitationsLeft: integer("invitations_left").default(2).notNull(),
	googleCalendarToken: jsonb("google_calendar_token"),
	settings: jsonb(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [users.id],
			name: "profiles_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const teams = pgTable("teams", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	adminId: uuid("admin_id").notNull(),
	settings: jsonb(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [profiles.id],
			name: "teams_admin_id_profiles_id_fk"
		}),
]);

export const pipelineStages = pgTable("pipeline_stages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id"),
	teamId: uuid("team_id"),
	name: text().notNull(),
	order: integer().notNull(),
	color: text().notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "pipeline_stages_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "pipeline_stages_team_id_teams_id_fk"
		}),
]);

export const documents = pgTable("documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	insuranceInfoId: uuid("insurance_info_id"),
	agentId: uuid("agent_id").notNull(),
	documentType: documentType("document_type").notNull(),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	mimeType: text("mime_type").notNull(),
	size: integer().notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "documents_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "documents_client_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.insuranceInfoId],
			foreignColumns: [insuranceInfo.id],
			name: "documents_insurance_info_id_insurance_info_id_fk"
		}),
]);

export const insuranceInfo = pgTable("insurance_info", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	insuranceType: insuranceType("insurance_type").notNull(),
	details: jsonb().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "insurance_info_client_id_clients_id_fk"
		}),
]);

export const invitations = pgTable("invitations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	inviterId: uuid("inviter_id").notNull(),
	inviteeEmail: text("invitee_email"),
	message: text(),
	status: invitationStatus().default('pending').notNull(),
	usedById: uuid("used_by_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	usedAt: timestamp("used_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.inviterId],
			foreignColumns: [profiles.id],
			name: "invitations_inviter_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.usedById],
			foreignColumns: [profiles.id],
			name: "invitations_used_by_id_profiles_id_fk"
		}),
	unique("invitations_code_unique").on(table.code),
]);

export const meetings = pgTable("meetings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	agentId: uuid("agent_id").notNull(),
	title: text().notNull(),
	description: text(),
	startTime: timestamp("start_time", { withTimezone: true, mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { withTimezone: true, mode: 'string' }).notNull(),
	location: text(),
	meetingType: meetingType("meeting_type").notNull(),
	status: meetingStatus().default('scheduled').notNull(),
	googleEventId: text("google_event_id"),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "meetings_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "meetings_client_id_clients_id_fk"
		}),
]);

export const referrals = pgTable("referrals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	referrerId: uuid("referrer_id").notNull(),
	referredId: uuid("referred_id").notNull(),
	agentId: uuid("agent_id").notNull(),
	referralDate: date("referral_date").defaultNow().notNull(),
	notes: text(),
	status: referralStatus().default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "referrals_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.referredId],
			foreignColumns: [clients.id],
			name: "referrals_referred_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.referrerId],
			foreignColumns: [clients.id],
			name: "referrals_referrer_id_clients_id_fk"
		}),
]);

export const calendarSettings = pgTable("calendar_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	defaultView: calendarView("default_view").default('month').notNull(),
	workingHours: jsonb("working_hours"),
	timeZone: text("time_zone").default('Asia/Seoul').notNull(),
	googleCalendarSync: boolean("google_calendar_sync").default(false).notNull(),
	defaultMeetingDuration: integer("default_meeting_duration").default(60).notNull(),
	defaultReminder: reminderType("default_reminder").default('30_minutes').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "calendar_settings_agent_id_profiles_id_fk"
		}),
	unique("calendar_settings_agent_id_unique").on(table.agentId),
]);

export const meetingAttendees = pgTable("meeting_attendees", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	meetingId: uuid("meeting_id").notNull(),
	clientId: uuid("client_id"),
	agentId: uuid("agent_id"),
	externalEmail: text("external_email"),
	externalName: text("external_name"),
	status: text().default('pending').notNull(),
	responseAt: timestamp("response_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "meeting_attendees_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "meeting_attendees_client_id_clients_id_fk"
		}),
	foreignKey({
			columns: [table.meetingId],
			foreignColumns: [meetings.id],
			name: "meeting_attendees_meeting_id_meetings_id_fk"
		}).onDelete("cascade"),
]);

export const meetingNotes = pgTable("meeting_notes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	meetingId: uuid("meeting_id").notNull(),
	agentId: uuid("agent_id").notNull(),
	content: text().notNull(),
	isPrivate: boolean("is_private").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "meeting_notes_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.meetingId],
			foreignColumns: [meetings.id],
			name: "meeting_notes_meeting_id_meetings_id_fk"
		}).onDelete("cascade"),
]);

export const meetingReminders = pgTable("meeting_reminders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	meetingId: uuid("meeting_id").notNull(),
	reminderType: reminderType("reminder_type").notNull(),
	reminderTime: timestamp("reminder_time", { withTimezone: true, mode: 'string' }).notNull(),
	isSent: boolean("is_sent").default(false).notNull(),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.meetingId],
			foreignColumns: [meetings.id],
			name: "meeting_reminders_meeting_id_meetings_id_fk"
		}).onDelete("cascade"),
]);

export const meetingTemplates = pgTable("meeting_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	name: text().notNull(),
	description: text(),
	defaultDuration: integer("default_duration").default(60).notNull(),
	defaultLocation: text("default_location"),
	checklist: jsonb(),
	isDefault: boolean("is_default").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "meeting_templates_agent_id_profiles_id_fk"
		}),
]);

export const recurringMeetings = pgTable("recurring_meetings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	parentMeetingId: uuid("parent_meeting_id").notNull(),
	recurrenceType: recurrenceType("recurrence_type").notNull(),
	recurrenceInterval: integer("recurrence_interval").default(1).notNull(),
	recurrenceEnd: timestamp("recurrence_end", { withTimezone: true, mode: 'string' }),
	maxOccurrences: integer("max_occurrences"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.parentMeetingId],
			foreignColumns: [meetings.id],
			name: "recurring_meetings_parent_meeting_id_meetings_id_fk"
		}),
]);

export const clientAnalytics = pgTable("client_analytics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	totalContacts: integer("total_contacts").default(0),
	lastContactDate: timestamp("last_contact_date", { withTimezone: true, mode: 'string' }),
	averageResponseTime: integer("average_response_time"),
	engagementScore: numeric("engagement_score", { precision: 5, scale:  2 }),
	conversionProbability: numeric("conversion_probability", { precision: 5, scale:  2 }),
	lifetimeValue: numeric("lifetime_value", { precision: 12, scale:  2 }),
	acquisitionCost: numeric("acquisition_cost", { precision: 10, scale:  2 }),
	referralCount: integer("referral_count").default(0),
	referralValue: numeric("referral_value", { precision: 12, scale:  2 }).default('0'),
	lastAnalyzedAt: timestamp("last_analyzed_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_analytics_client_id_clients_id_fk"
		}).onDelete("cascade"),
	unique("client_analytics_client_id_unique").on(table.clientId),
]);

export const clientContactHistory = pgTable("client_contact_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	agentId: uuid("agent_id").notNull(),
	contactMethod: contactMethod("contact_method").notNull(),
	subject: text(),
	content: text(),
	duration: integer(),
	outcome: text(),
	nextAction: text("next_action"),
	nextActionDate: timestamp("next_action_date", { withTimezone: true, mode: 'string' }),
	attachments: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "client_contact_history_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_contact_history_client_id_clients_id_fk"
		}).onDelete("cascade"),
]);

export const clientFamilyMembers = pgTable("client_family_members", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	name: text().notNull(),
	relationship: text().notNull(),
	birthDate: timestamp("birth_date", { withTimezone: true, mode: 'string' }),
	gender: text(),
	occupation: text(),
	phone: text(),
	email: text(),
	hasInsurance: boolean("has_insurance").default(false),
	insuranceDetails: jsonb("insurance_details"),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_family_members_client_id_clients_id_fk"
		}).onDelete("cascade"),
]);

export const clientMilestones = pgTable("client_milestones", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	agentId: uuid("agent_id").notNull(),
	title: text().notNull(),
	description: text(),
	category: text(),
	value: numeric({ precision: 12, scale:  2 }),
	achievedAt: timestamp("achieved_at", { withTimezone: true, mode: 'string' }).notNull(),
	isSignificant: boolean("is_significant").default(false),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "client_milestones_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_milestones_client_id_clients_id_fk"
		}).onDelete("cascade"),
]);

export const clientPreferences = pgTable("client_preferences", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	preferredContactMethod: contactMethod("preferred_contact_method").default('phone'),
	preferredContactTime: jsonb("preferred_contact_time"),
	communicationStyle: text("communication_style"),
	interests: text().array(),
	concerns: text().array(),
	budget: jsonb(),
	riskTolerance: text("risk_tolerance"),
	investmentGoals: text("investment_goals").array(),
	specialNeeds: text("special_needs"),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_preferences_client_id_clients_id_fk"
		}).onDelete("cascade"),
	unique("client_preferences_client_id_unique").on(table.clientId),
]);

export const clientTagAssignments = pgTable("client_tag_assignments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	tagId: uuid("tag_id").notNull(),
	assignedAt: timestamp("assigned_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "client_tag_assignments_client_id_clients_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [clientTags.id],
			name: "client_tag_assignments_tag_id_client_tags_id_fk"
		}).onDelete("cascade"),
]);

export const clientTags = pgTable("client_tags", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	name: text().notNull(),
	color: text().notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "client_tags_agent_id_profiles_id_fk"
		}),
]);

export const activityLogs = pgTable("activity_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	activityType: activityType("activity_type").notNull(),
	entityType: text("entity_type"),
	entityId: uuid("entity_id"),
	title: text().notNull(),
	description: text().notNull(),
	metadata: jsonb(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "activity_logs_user_id_profiles_id_fk"
		}),
]);

export const dashboardWidgets = pgTable("dashboard_widgets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	widgetType: text("widget_type").notNull(),
	title: text().notNull(),
	position: jsonb().notNull(),
	config: jsonb().notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "dashboard_widgets_user_id_profiles_id_fk"
		}),
]);

export const goals = pgTable("goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	teamId: uuid("team_id"),
	title: text().notNull(),
	description: text(),
	goalType: goalType("goal_type").notNull(),
	targetValue: numeric("target_value", { precision: 15, scale:  2 }).notNull(),
	currentValue: numeric("current_value", { precision: 15, scale:  2 }).default('0').notNull(),
	period: goalPeriod().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	isAchieved: boolean("is_achieved").default(false).notNull(),
	achievedAt: timestamp("achieved_at", { withTimezone: true, mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "goals_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "goals_team_id_teams_id_fk"
		}),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: text().notNull(),
	message: text().notNull(),
	type: notificationType().notNull(),
	priority: notificationPriority().default('normal').notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	actionUrl: text("action_url"),
	actionLabel: text("action_label"),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "notifications_user_id_profiles_id_fk"
		}),
]);

export const performanceMetrics = pgTable("performance_metrics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	teamId: uuid("team_id"),
	date: date().notNull(),
	period: metricPeriod().notNull(),
	newClients: integer("new_clients").default(0).notNull(),
	totalMeetings: integer("total_meetings").default(0).notNull(),
	completedMeetings: integer("completed_meetings").default(0).notNull(),
	cancelledMeetings: integer("cancelled_meetings").default(0).notNull(),
	newReferrals: integer("new_referrals").default(0).notNull(),
	convertedReferrals: integer("converted_referrals").default(0).notNull(),
	totalRevenue: numeric("total_revenue", { precision: 15, scale:  2 }).default('0').notNull(),
	conversionRate: numeric("conversion_rate", { precision: 5, scale:  2 }).default('0').notNull(),
	averageDealSize: numeric("average_deal_size", { precision: 12, scale:  2 }).default('0').notNull(),
	pipelineValue: numeric("pipeline_value", { precision: 15, scale:  2 }).default('0').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "performance_metrics_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "performance_metrics_team_id_teams_id_fk"
		}),
]);

export const quickActions = pgTable("quick_actions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	actionType: text("action_type").notNull(),
	label: text().notNull(),
	icon: text(),
	url: text().notNull(),
	order: integer().default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "quick_actions_user_id_profiles_id_fk"
		}),
]);

export const influencerProfiles = pgTable("influencer_profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	agentId: uuid("agent_id").notNull(),
	tier: influencerTier().default('bronze').notNull(),
	totalReferrals: integer("total_referrals").default(0).notNull(),
	successfulReferrals: integer("successful_referrals").default(0).notNull(),
	conversionRate: numeric("conversion_rate", { precision: 5, scale:  2 }).default('0').notNull(),
	totalContractValue: numeric("total_contract_value", { precision: 15, scale:  2 }).default('0').notNull(),
	networkDepth: integer("network_depth").default(0).notNull(),
	networkWidth: integer("network_width").default(0).notNull(),
	relationshipStrength: numeric("relationship_strength", { precision: 3, scale:  2 }).default('0').notNull(),
	lastReferralDate: date("last_referral_date"),
	lastGratitudeDate: date("last_gratitude_date"),
	preferredContactMethod: contactMethod("preferred_contact_method"),
	specialNotes: text("special_notes"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "influencer_profiles_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "influencer_profiles_client_id_clients_id_fk"
		}).onDelete("cascade"),
	unique("influencer_profiles_client_id_unique").on(table.clientId),
]);

export const gratitudeHistory = pgTable("gratitude_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	influencerId: uuid("influencer_id").notNull(),
	agentId: uuid("agent_id").notNull(),
	gratitudeType: gratitudeType("gratitude_type").notNull(),
	giftType: giftType("gift_type").default('none').notNull(),
	title: text().notNull(),
	message: text().notNull(),
	scheduledDate: date("scheduled_date"),
	sentDate: date("sent_date"),
	deliveredDate: date("delivered_date"),
	status: gratitudeStatus().default('planned').notNull(),
	cost: numeric({ precision: 10, scale:  2 }).default('0'),
	vendor: text(),
	trackingNumber: text("tracking_number"),
	recipientFeedback: text("recipient_feedback"),
	notes: text(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "gratitude_history_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.influencerId],
			foreignColumns: [influencerProfiles.id],
			name: "gratitude_history_influencer_id_influencer_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const gratitudeTemplates = pgTable("gratitude_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	teamId: uuid("team_id"),
	name: text().notNull(),
	gratitudeType: gratitudeType("gratitude_type").notNull(),
	giftType: giftType("gift_type").default('none').notNull(),
	titleTemplate: text("title_template").notNull(),
	messageTemplate: text("message_template").notNull(),
	estimatedCost: numeric("estimated_cost", { precision: 10, scale:  2 }).default('0'),
	recommendedVendors: text("recommended_vendors").array(),
	usageCount: integer("usage_count").default(0).notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "gratitude_templates_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "gratitude_templates_team_id_teams_id_fk"
		}),
]);

export const networkAnalysis = pgTable("network_analysis", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	teamId: uuid("team_id"),
	analysisDate: date("analysis_date").notNull(),
	totalInfluencers: integer("total_influencers").default(0).notNull(),
	averageConversionRate: numeric("average_conversion_rate", { precision: 5, scale:  2 }).default('0').notNull(),
	totalNetworkValue: numeric("total_network_value", { precision: 15, scale:  2 }).default('0').notNull(),
	averageNetworkDepth: numeric("average_network_depth", { precision: 5, scale:  2 }).default('0').notNull(),
	averageNetworkWidth: numeric("average_network_width", { precision: 5, scale:  2 }).default('0').notNull(),
	topInfluencerIds: text("top_influencer_ids").array(),
	networkGrowthRate: numeric("network_growth_rate", { precision: 5, scale:  2 }).default('0').notNull(),
	analysisMetadata: jsonb("analysis_metadata"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "network_analysis_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "network_analysis_team_id_teams_id_fk"
		}),
]);

export const referralPatterns = pgTable("referral_patterns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	influencerId: uuid("influencer_id").notNull(),
	agentId: uuid("agent_id").notNull(),
	month: date().notNull(),
	referralCount: integer("referral_count").default(0).notNull(),
	successfulCount: integer("successful_count").default(0).notNull(),
	averageTimeBetweenReferrals: integer("average_time_between_referrals").default(0),
	preferredReferralDay: text("preferred_referral_day"),
	preferredReferralTime: text("preferred_referral_time"),
	seasonalTrends: jsonb("seasonal_trends"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "referral_patterns_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.influencerId],
			foreignColumns: [influencerProfiles.id],
			name: "referral_patterns_influencer_id_influencer_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const invitationAnalytics = pgTable("invitation_analytics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	date: date().notNull(),
	invitationsSent: integer("invitations_sent").default(0).notNull(),
	invitationsViewed: integer("invitations_viewed").default(0).notNull(),
	invitationsUsed: integer("invitations_used").default(0).notNull(),
	newRegistrations: integer("new_registrations").default(0).notNull(),
	conversionRate: integer("conversion_rate").default(0).notNull(),
	topSource: invitationSource("top_source"),
	analyticsData: jsonb("analytics_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "invitation_analytics_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "invitation_analytics_user_id_profiles_id_fk"
		}),
]);

export const invitationCampaigns = pgTable("invitation_campaigns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	name: text().notNull(),
	description: text(),
	templateId: uuid("template_id"),
	targetAudience: text("target_audience"),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
	maxInvitations: integer("max_invitations"),
	currentInvitations: integer("current_invitations").default(0).notNull(),
	bonusRewards: jsonb("bonus_rewards"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "invitation_campaigns_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [invitationTemplates.id],
			name: "invitation_campaigns_template_id_invitation_templates_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "invitation_campaigns_user_id_profiles_id_fk"
		}),
]);

export const invitationTemplates = pgTable("invitation_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	name: text().notNull(),
	subject: text().notNull(),
	messageTemplate: text("message_template").notNull(),
	type: invitationType().default('standard').notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	usageCount: integer("usage_count").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "invitation_templates_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "invitation_templates_user_id_profiles_id_fk"
		}),
]);

export const invitationReferralTracking = pgTable("invitation_referral_tracking", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	invitationId: uuid("invitation_id").notNull(),
	referralSource: text("referral_source"),
	referralDetails: jsonb("referral_details"),
	conversionPath: jsonb("conversion_path"),
	attributionScore: integer("attribution_score").default(100).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.invitationId],
			foreignColumns: [invitations.id],
			name: "invitation_referral_tracking_invitation_id_invitations_id_fk"
		}),
]);

export const invitationRewards = pgTable("invitation_rewards", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	inviterId: uuid("inviter_id").notNull(),
	inviteeId: uuid("invitee_id").notNull(),
	invitationId: uuid("invitation_id").notNull(),
	rewardType: text("reward_type").notNull(),
	rewardValue: integer("reward_value").notNull(),
	rewardDescription: text("reward_description").notNull(),
	isGranted: boolean("is_granted").default(false).notNull(),
	grantedAt: timestamp("granted_at", { withTimezone: true, mode: 'string' }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.invitationId],
			foreignColumns: [invitations.id],
			name: "invitation_rewards_invitation_id_invitations_id_fk"
		}),
	foreignKey({
			columns: [table.inviteeId],
			foreignColumns: [profiles.id],
			name: "invitation_rewards_invitee_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.inviterId],
			foreignColumns: [profiles.id],
			name: "invitation_rewards_inviter_id_profiles_id_fk"
		}),
]);

export const invitationUsageLogs = pgTable("invitation_usage_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	invitationId: uuid("invitation_id").notNull(),
	userId: uuid("user_id"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	referrer: text(),
	action: usageAction().notNull(),
	actionData: jsonb("action_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.invitationId],
			foreignColumns: [invitations.id],
			name: "invitation_usage_logs_invitation_id_invitations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "invitation_usage_logs_user_id_profiles_id_fk"
		}),
]);

export const invitationWaitlist = pgTable("invitation_waitlist", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	phone: text(),
	company: text(),
	referredBy: text("referred_by"),
	requestMessage: text("request_message"),
	priority: integer().default(0).notNull(),
	status: waitlistStatus().default('waiting').notNull(),
	invitedAt: timestamp("invited_at", { withTimezone: true, mode: 'string' }),
	invitationId: uuid("invitation_id"),
	registeredAt: timestamp("registered_at", { withTimezone: true, mode: 'string' }),
	registeredUserId: uuid("registered_user_id"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.invitationId],
			foreignColumns: [invitations.id],
			name: "invitation_waitlist_invitation_id_invitations_id_fk"
		}),
	foreignKey({
			columns: [table.registeredUserId],
			foreignColumns: [profiles.id],
			name: "invitation_waitlist_registered_user_id_profiles_id_fk"
		}),
	unique("invitation_waitlist_email_unique").on(table.email),
]);

export const networkAnalysisResults = pgTable("network_analysis_results", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	teamId: uuid("team_id"),
	analysisType: networkAnalysisType("analysis_type").notNull(),
	analysisDate: timestamp("analysis_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	totalNodes: integer("total_nodes").default(0).notNull(),
	totalConnections: integer("total_connections").default(0).notNull(),
	networkDensity: numeric("network_density", { precision: 5, scale:  4 }).default('0'),
	averagePathLength: numeric("average_path_length", { precision: 5, scale:  2 }).default('0'),
	clusteringCoefficient: numeric("clustering_coefficient", { precision: 5, scale:  4 }).default('0'),
	topInfluencers: jsonb("top_influencers"),
	communityStructure: jsonb("community_structure"),
	growthMetrics: jsonb("growth_metrics"),
	recommendations: jsonb(),
	rawData: jsonb("raw_data"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "network_analysis_results_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "network_analysis_results_team_id_teams_id_fk"
		}),
]);

export const networkConnections = pgTable("network_connections", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	sourceNodeId: uuid("source_node_id").notNull(),
	targetNodeId: uuid("target_node_id").notNull(),
	connectionType: connectionType("connection_type").notNull(),
	strength: numeric({ precision: 3, scale:  2 }).default('1.0').notNull(),
	bidirectional: boolean().default(true).notNull(),
	description: text(),
	establishedDate: date("established_date"),
	lastInteraction: timestamp("last_interaction", { withTimezone: true, mode: 'string' }),
	interactionCount: integer("interaction_count").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "network_connections_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.sourceNodeId],
			foreignColumns: [networkNodes.id],
			name: "network_connections_source_node_id_network_nodes_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.targetNodeId],
			foreignColumns: [networkNodes.id],
			name: "network_connections_target_node_id_network_nodes_id_fk"
		}).onDelete("cascade"),
]);

export const networkNodes = pgTable("network_nodes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	clientId: uuid("client_id"),
	nodeType: networkNodeType("node_type").notNull(),
	name: text().notNull(),
	email: text(),
	phone: text(),
	company: text(),
	position: text(),
	location: text(),
	tags: text().array(),
	centralityScore: numeric("centrality_score", { precision: 8, scale:  4 }).default('0'),
	influenceScore: numeric("influence_score", { precision: 8, scale:  4 }).default('0'),
	connectionsCount: integer("connections_count").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "network_nodes_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "network_nodes_client_id_clients_id_fk"
		}),
]);

export const networkEvents = pgTable("network_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	teamId: uuid("team_id"),
	title: text().notNull(),
	description: text(),
	eventType: text("event_type").notNull(),
	eventDate: timestamp("event_date", { withTimezone: true, mode: 'string' }).notNull(),
	location: text(),
	attendeeCount: integer("attendee_count").default(0).notNull(),
	newConnections: integer("new_connections").default(0).notNull(),
	followUpActions: jsonb("follow_up_actions"),
	outcomes: jsonb(),
	cost: numeric({ precision: 10, scale:  2 }),
	roi: numeric({ precision: 8, scale:  2 }),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "network_events_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "network_events_team_id_teams_id_fk"
		}),
]);

export const networkInteractions = pgTable("network_interactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	connectionId: uuid("connection_id").notNull(),
	interactionType: text("interaction_type").notNull(),
	interactionDate: timestamp("interaction_date", { withTimezone: true, mode: 'string' }).notNull(),
	description: text(),
	outcome: text(),
	strengthChange: numeric("strength_change", { precision: 3, scale:  2 }).default('0'),
	notes: text(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "network_interactions_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.connectionId],
			foreignColumns: [networkConnections.id],
			name: "network_interactions_connection_id_network_connections_id_fk"
		}).onDelete("cascade"),
]);

export const networkOpportunities = pgTable("network_opportunities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	agentId: uuid("agent_id").notNull(),
	sourceNodeId: uuid("source_node_id").notNull(),
	targetNodeId: uuid("target_node_id"),
	opportunityType: text("opportunity_type").notNull(),
	title: text().notNull(),
	description: text(),
	potentialValue: numeric("potential_value", { precision: 12, scale:  2 }),
	probability: numeric({ precision: 3, scale:  2 }).default('0.5'),
	priority: text().default('medium').notNull(),
	status: text().default('identified').notNull(),
	dueDate: timestamp("due_date", { withTimezone: true, mode: 'string' }),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	actualValue: numeric("actual_value", { precision: 12, scale:  2 }),
	notes: text(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [profiles.id],
			name: "network_opportunities_agent_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.sourceNodeId],
			foreignColumns: [networkNodes.id],
			name: "network_opportunities_source_node_id_network_nodes_id_fk"
		}),
	foreignKey({
			columns: [table.targetNodeId],
			foreignColumns: [networkNodes.id],
			name: "network_opportunities_target_node_id_network_nodes_id_fk"
		}),
]);

export const notificationHistory = pgTable("notification_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	queueId: uuid("queue_id"),
	type: notificationType().notNull(),
	channel: notificationChannel().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	recipient: text().notNull(),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }).notNull(),
	deliveredAt: timestamp("delivered_at", { withTimezone: true, mode: 'string' }),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }),
	status: notificationStatus().notNull(),
	responseData: jsonb("response_data"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.queueId],
			foreignColumns: [notificationQueue.id],
			name: "notification_history_queue_id_notification_queue_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "notification_history_user_id_profiles_id_fk"
		}),
]);

export const notificationQueue = pgTable("notification_queue", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	templateId: uuid("template_id"),
	type: notificationType().notNull(),
	channel: notificationChannel().notNull(),
	priority: notificationPriority().default('normal').notNull(),
	title: text().notNull(),
	message: text().notNull(),
	recipient: text().notNull(),
	scheduledAt: timestamp("scheduled_at", { withTimezone: true, mode: 'string' }).notNull(),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { withTimezone: true, mode: 'string' }),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }),
	status: notificationStatus().default('pending').notNull(),
	retryCount: integer("retry_count").default(0).notNull(),
	maxRetries: integer("max_retries").default(3).notNull(),
	errorMessage: text("error_message"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [notificationTemplates.id],
			name: "notification_queue_template_id_notification_templates_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "notification_queue_user_id_profiles_id_fk"
		}),
]);

export const notificationTemplates = pgTable("notification_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	teamId: uuid("team_id"),
	type: notificationType().notNull(),
	channel: notificationChannel().notNull(),
	name: text().notNull(),
	subject: text(),
	bodyTemplate: text("body_template").notNull(),
	variables: jsonb(),
	isDefault: boolean("is_default").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	usageCount: integer("usage_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "notification_templates_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "notification_templates_user_id_profiles_id_fk"
		}),
]);

export const notificationRules = pgTable("notification_rules", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	name: text().notNull(),
	description: text(),
	triggerEvent: text("trigger_event").notNull(),
	conditions: jsonb().notNull(),
	actions: jsonb().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	lastTriggered: timestamp("last_triggered", { withTimezone: true, mode: 'string' }),
	triggerCount: integer("trigger_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "notification_rules_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "notification_rules_user_id_profiles_id_fk"
		}),
]);

export const notificationSettings = pgTable("notification_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	emailNotifications: boolean("email_notifications").default(true).notNull(),
	smsNotifications: boolean("sms_notifications").default(false).notNull(),
	pushNotifications: boolean("push_notifications").default(true).notNull(),
	kakaoNotifications: boolean("kakao_notifications").default(false).notNull(),
	meetingReminders: boolean("meeting_reminders").default(true).notNull(),
	goalDeadlines: boolean("goal_deadlines").default(true).notNull(),
	newReferrals: boolean("new_referrals").default(true).notNull(),
	clientMilestones: boolean("client_milestones").default(true).notNull(),
	teamUpdates: boolean("team_updates").default(true).notNull(),
	systemAlerts: boolean("system_alerts").default(true).notNull(),
	birthdayReminders: boolean("birthday_reminders").default(true).notNull(),
	followUpReminders: boolean("follow_up_reminders").default(true).notNull(),
	quietHoursStart: text("quiet_hours_start").default('22:00'),
	quietHoursEnd: text("quiet_hours_end").default('08:00'),
	weekendNotifications: boolean("weekend_notifications").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "notification_settings_user_id_profiles_id_fk"
		}),
	unique("notification_settings_user_id_unique").on(table.userId),
]);

export const notificationSubscriptions = pgTable("notification_subscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	entityType: text("entity_type").notNull(),
	entityId: uuid("entity_id").notNull(),
	notificationTypes: text("notification_types").array().notNull(),
	channels: text().array().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "notification_subscriptions_user_id_profiles_id_fk"
		}),
]);

export const pipelineAnalytics = pgTable("pipeline_analytics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	date: date().notNull(),
	stageId: uuid("stage_id").notNull(),
	clientsEntered: integer("clients_entered").default(0).notNull(),
	clientsExited: integer("clients_exited").default(0).notNull(),
	clientsRemaining: integer("clients_remaining").default(0).notNull(),
	averageTimeInStage: numeric("average_time_in_stage", { precision: 8, scale:  2 }),
	conversionRate: numeric("conversion_rate", { precision: 5, scale:  2 }),
	totalValue: numeric("total_value", { precision: 15, scale:  2 }).default('0'),
	averageValue: numeric("average_value", { precision: 12, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.stageId],
			foreignColumns: [pipelineStages.id],
			name: "pipeline_analytics_stage_id_pipeline_stages_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "pipeline_analytics_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "pipeline_analytics_user_id_profiles_id_fk"
		}),
]);

export const pipelineAutomations = pgTable("pipeline_automations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	name: text().notNull(),
	description: text(),
	trigger: automationTrigger().notNull(),
	triggerConditions: jsonb("trigger_conditions").notNull(),
	actions: jsonb().notNull(),
	stageId: uuid("stage_id"),
	isActive: boolean("is_active").default(true).notNull(),
	executionCount: integer("execution_count").default(0).notNull(),
	lastExecuted: timestamp("last_executed", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.stageId],
			foreignColumns: [pipelineStages.id],
			name: "pipeline_automations_stage_id_pipeline_stages_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "pipeline_automations_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "pipeline_automations_user_id_profiles_id_fk"
		}),
]);

export const pipelineBottlenecks = pgTable("pipeline_bottlenecks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	stageId: uuid("stage_id").notNull(),
	analysisDate: date("analysis_date").notNull(),
	clientsStuck: integer("clients_stuck").default(0).notNull(),
	averageStuckTime: numeric("average_stuck_time", { precision: 8, scale:  2 }),
	bottleneckScore: numeric("bottleneck_score", { precision: 5, scale:  2 }),
	recommendations: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.stageId],
			foreignColumns: [pipelineStages.id],
			name: "pipeline_bottlenecks_stage_id_pipeline_stages_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "pipeline_bottlenecks_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "pipeline_bottlenecks_user_id_profiles_id_fk"
		}),
]);

export const pipelineGoals = pgTable("pipeline_goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	stageId: uuid("stage_id"),
	goalType: text("goal_type").notNull(),
	targetValue: numeric("target_value", { precision: 15, scale:  2 }).notNull(),
	currentValue: numeric("current_value", { precision: 15, scale:  2 }).default('0'),
	period: text().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	isAchieved: boolean("is_achieved").default(false).notNull(),
	achievedAt: timestamp("achieved_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.stageId],
			foreignColumns: [pipelineStages.id],
			name: "pipeline_goals_stage_id_pipeline_stages_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "pipeline_goals_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "pipeline_goals_user_id_profiles_id_fk"
		}),
]);

export const pipelineViews = pgTable("pipeline_views", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	name: text().notNull(),
	description: text(),
	viewType: pipelineViewType("view_type").default('kanban').notNull(),
	filters: jsonb(),
	sortBy: text("sort_by").default('created_at'),
	sortOrder: text("sort_order").default('desc'),
	groupBy: text("group_by"),
	visibleStages: text("visible_stages").array(),
	columnSettings: jsonb("column_settings"),
	isDefault: boolean("is_default").default(false).notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
	usageCount: integer("usage_count").default(0).notNull(),
	lastUsed: timestamp("last_used", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "pipeline_views_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "pipeline_views_user_id_profiles_id_fk"
		}),
]);

export const stageHistory = pgTable("stage_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	fromStageId: uuid("from_stage_id"),
	toStageId: uuid("to_stage_id").notNull(),
	changedBy: uuid("changed_by").notNull(),
	actionType: stageActionType("action_type").notNull(),
	reason: text(),
	notes: text(),
	timeInPreviousStage: integer("time_in_previous_stage"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [profiles.id],
			name: "stage_history_changed_by_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "stage_history_client_id_clients_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.fromStageId],
			foreignColumns: [pipelineStages.id],
			name: "stage_history_from_stage_id_pipeline_stages_id_fk"
		}),
	foreignKey({
			columns: [table.toStageId],
			foreignColumns: [pipelineStages.id],
			name: "stage_history_to_stage_id_pipeline_stages_id_fk"
		}),
]);

export const stageTemplates = pgTable("stage_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	teamId: uuid("team_id"),
	name: text().notNull(),
	description: text(),
	category: text(),
	stages: jsonb().notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
	usageCount: integer("usage_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "stage_templates_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "stage_templates_user_id_profiles_id_fk"
		}),
]);

export const reportDashboards = pgTable("report_dashboards", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	name: text().notNull(),
	description: text(),
	layout: jsonb().notNull(),
	widgets: jsonb().notNull(),
	filters: jsonb(),
	refreshInterval: integer("refresh_interval").default(300),
	isPublic: boolean("is_public").default(false).notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	viewCount: integer("view_count").default(0).notNull(),
	lastViewed: timestamp("last_viewed", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "report_dashboards_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "report_dashboards_user_id_profiles_id_fk"
		}),
]);

export const reportExports = pgTable("report_exports", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	reportInstanceId: uuid("report_instance_id"),
	format: reportFormat().notNull(),
	filePath: text("file_path").notNull(),
	fileSize: integer("file_size").notNull(),
	downloadCount: integer("download_count").default(0).notNull(),
	lastDownloaded: timestamp("last_downloaded", { withTimezone: true, mode: 'string' }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.reportInstanceId],
			foreignColumns: [reportInstances.id],
			name: "report_exports_report_instance_id_report_instances_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "report_exports_user_id_profiles_id_fk"
		}),
]);

export const reportInstances = pgTable("report_instances", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	templateId: uuid("template_id"),
	scheduleId: uuid("schedule_id"),
	name: text().notNull(),
	type: reportType().notNull(),
	format: reportFormat().notNull(),
	status: reportStatus().default('pending').notNull(),
	filePath: text("file_path"),
	fileSize: integer("file_size"),
	parameters: jsonb(),
	data: jsonb(),
	metadata: jsonb(),
	generatedAt: timestamp("generated_at", { withTimezone: true, mode: 'string' }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	downloadCount: integer("download_count").default(0).notNull(),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.scheduleId],
			foreignColumns: [reportSchedules.id],
			name: "report_instances_schedule_id_report_schedules_id_fk"
		}),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [reportTemplates.id],
			name: "report_instances_template_id_report_templates_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "report_instances_user_id_profiles_id_fk"
		}),
]);

export const reportTemplates = pgTable("report_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	teamId: uuid("team_id"),
	name: text().notNull(),
	description: text(),
	type: reportType().notNull(),
	category: text(),
	config: jsonb().notNull(),
	layout: jsonb(),
	filters: jsonb(),
	charts: jsonb(),
	isDefault: boolean("is_default").default(false).notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
	usageCount: integer("usage_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "report_templates_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "report_templates_user_id_profiles_id_fk"
		}),
]);

export const reportSchedules = pgTable("report_schedules", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	templateId: uuid("template_id").notNull(),
	name: text().notNull(),
	description: text(),
	frequency: reportFrequency().notNull(),
	format: reportFormat().default('pdf').notNull(),
	recipients: text().array().notNull(),
	filters: jsonb(),
	nextRunAt: timestamp("next_run_at", { withTimezone: true, mode: 'string' }),
	lastRunAt: timestamp("last_run_at", { withTimezone: true, mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	runCount: integer("run_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "report_schedules_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [reportTemplates.id],
			name: "report_schedules_template_id_report_templates_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "report_schedules_user_id_profiles_id_fk"
		}),
]);

export const reportMetrics = pgTable("report_metrics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	date: date().notNull(),
	metricType: text("metric_type").notNull(),
	value: numeric({ precision: 15, scale:  2 }).notNull(),
	previousValue: numeric("previous_value", { precision: 15, scale:  2 }),
	changePercent: numeric("change_percent", { precision: 5, scale:  2 }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "report_metrics_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "report_metrics_user_id_profiles_id_fk"
		}),
]);

export const reportSubscriptions = pgTable("report_subscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	templateId: uuid("template_id").notNull(),
	email: text().notNull(),
	frequency: reportFrequency().notNull(),
	format: reportFormat().default('pdf').notNull(),
	filters: jsonb(),
	isActive: boolean("is_active").default(true).notNull(),
	lastSent: timestamp("last_sent", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [reportTemplates.id],
			name: "report_subscriptions_template_id_report_templates_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "report_subscriptions_user_id_profiles_id_fk"
		}),
]);

export const apiKeys = pgTable("api_keys", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	name: text().notNull(),
	description: text(),
	keyHash: text("key_hash").notNull(),
	permissions: text().array().notNull(),
	lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: 'string' }),
	usageCount: integer("usage_count").default(0).notNull(),
	rateLimit: integer("rate_limit").default(1000).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "api_keys_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "api_keys_user_id_profiles_id_fk"
		}),
	unique("api_keys_key_hash_unique").on(table.keyHash),
]);

export const auditLogs = pgTable("audit_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	teamId: uuid("team_id"),
	action: auditAction().notNull(),
	entityType: text("entity_type"),
	entityId: uuid("entity_id"),
	description: text().notNull(),
	changes: jsonb(),
	metadata: jsonb(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "audit_logs_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "audit_logs_user_id_profiles_id_fk"
		}),
]);

export const backupConfigurations = pgTable("backup_configurations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	teamId: uuid("team_id"),
	name: text().notNull(),
	description: text(),
	schedule: text().notNull(),
	includeData: text("include_data").array().notNull(),
	excludeData: text("exclude_data").array(),
	storageConfig: jsonb("storage_config").notNull(),
	retentionDays: integer("retention_days").default(30).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	lastBackupAt: timestamp("last_backup_at", { withTimezone: true, mode: 'string' }),
	nextBackupAt: timestamp("next_backup_at", { withTimezone: true, mode: 'string' }),
	backupCount: integer("backup_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "backup_configurations_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "backup_configurations_user_id_profiles_id_fk"
		}),
]);

export const featureFlags = pgTable("feature_flags", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	isEnabled: boolean("is_enabled").default(false).notNull(),
	rolloutPercentage: integer("rollout_percentage").default(0).notNull(),
	targetUsers: text("target_users").array(),
	targetTeams: text("target_teams").array(),
	conditions: jsonb(),
	metadata: jsonb(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [profiles.id],
			name: "feature_flags_created_by_profiles_id_fk"
		}),
	unique("feature_flags_name_unique").on(table.name),
]);

export const integrations = pgTable("integrations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	teamId: uuid("team_id"),
	type: integrationType().notNull(),
	name: text().notNull(),
	description: text(),
	config: jsonb().notNull(),
	credentials: jsonb(),
	status: integrationStatus().default('pending').notNull(),
	lastSyncAt: timestamp("last_sync_at", { withTimezone: true, mode: 'string' }),
	lastErrorAt: timestamp("last_error_at", { withTimezone: true, mode: 'string' }),
	errorMessage: text("error_message"),
	syncCount: integer("sync_count").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "integrations_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "integrations_user_id_profiles_id_fk"
		}),
]);

export const systemSettings = pgTable("system_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	category: settingCategory().notNull(),
	key: text().notNull(),
	value: jsonb().notNull(),
	type: settingType().notNull(),
	description: text(),
	isPublic: boolean("is_public").default(false).notNull(),
	updatedBy: uuid("updated_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [profiles.id],
			name: "system_settings_updated_by_profiles_id_fk"
		}),
	unique("system_settings_key_unique").on(table.key),
]);

export const teamSettings = pgTable("team_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	category: settingCategory().notNull(),
	key: text().notNull(),
	value: jsonb().notNull(),
	type: settingType().notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	description: text(),
	updatedBy: uuid("updated_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_settings_team_id_teams_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [profiles.id],
			name: "team_settings_updated_by_profiles_id_fk"
		}),
]);

export const userSettings = pgTable("user_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	category: settingCategory().notNull(),
	key: text().notNull(),
	value: jsonb().notNull(),
	type: settingType().notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "user_settings_user_id_profiles_id_fk"
		}),
	unique("user_settings_user_id_unique").on(table.userId),
]);

export const teamActivities = pgTable("team_activities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	userId: uuid("user_id"),
	eventType: teamEventType("event_type").notNull(),
	title: text().notNull(),
	description: text(),
	entityType: text("entity_type"),
	entityId: uuid("entity_id"),
	changes: jsonb(),
	metadata: jsonb(),
	isImportant: boolean("is_important").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_activities_team_id_teams_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "team_activities_user_id_profiles_id_fk"
		}),
]);

export const teamAnnouncements = pgTable("team_announcements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	authorId: uuid("author_id").notNull(),
	title: text().notNull(),
	content: text().notNull(),
	priority: text().default('normal').notNull(),
	isUrgent: boolean("is_urgent").default(false).notNull(),
	isPinned: boolean("is_pinned").default(false).notNull(),
	targetMembers: text("target_members").array(),
	readBy: text("read_by").array().default([""]),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	attachments: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [profiles.id],
			name: "team_announcements_author_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_announcements_team_id_teams_id_fk"
		}).onDelete("cascade"),
]);

export const teamCollaborations = pgTable("team_collaborations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	initiatedBy: uuid("initiated_by").notNull(),
	participants: text().array().notNull(),
	type: collaborationType().notNull(),
	title: text().notNull(),
	description: text(),
	relatedEntityType: text("related_entity_type"),
	relatedEntityId: uuid("related_entity_id"),
	status: text().default('active').notNull(),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	outcomes: jsonb(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.initiatedBy],
			foreignColumns: [profiles.id],
			name: "team_collaborations_initiated_by_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_collaborations_team_id_teams_id_fk"
		}).onDelete("cascade"),
]);

export const teamGoals = pgTable("team_goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	createdBy: uuid("created_by").notNull(),
	title: text().notNull(),
	description: text(),
	targetValue: numeric("target_value", { precision: 15, scale:  2 }).notNull(),
	currentValue: numeric("current_value", { precision: 15, scale:  2 }).default('0').notNull(),
	unit: text(),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	isAchieved: boolean("is_achieved").default(false).notNull(),
	achievedAt: timestamp("achieved_at", { withTimezone: true, mode: 'string' }),
	priority: text().default('medium').notNull(),
	assignedMembers: text("assigned_members").array(),
	milestones: jsonb(),
	rewards: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [profiles.id],
			name: "team_goals_created_by_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_goals_team_id_teams_id_fk"
		}).onDelete("cascade"),
]);

export const teamKnowledgeBase = pgTable("team_knowledge_base", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	authorId: uuid("author_id").notNull(),
	title: text().notNull(),
	content: text().notNull(),
	category: text(),
	tags: text().array(),
	isPublic: boolean("is_public").default(false).notNull(),
	isPinned: boolean("is_pinned").default(false).notNull(),
	viewCount: integer("view_count").default(0).notNull(),
	likeCount: integer("like_count").default(0).notNull(),
	lastViewedAt: timestamp("last_viewed_at", { withTimezone: true, mode: 'string' }),
	attachments: jsonb(),
	relatedArticles: text("related_articles").array(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [profiles.id],
			name: "team_knowledge_base_author_id_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_knowledge_base_team_id_teams_id_fk"
		}).onDelete("cascade"),
]);

export const teamMembers = pgTable("team_members", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	userId: uuid("user_id").notNull(),
	role: memberRole().default('member').notNull(),
	status: memberStatus().default('active').notNull(),
	permissions: text().array(),
	joinedAt: timestamp("joined_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	invitedBy: uuid("invited_by"),
	lastActiveAt: timestamp("last_active_at", { withTimezone: true, mode: 'string' }),
	notes: text(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.invitedBy],
			foreignColumns: [profiles.id],
			name: "team_members_invited_by_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_members_team_id_teams_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "team_members_user_id_profiles_id_fk"
		}).onDelete("cascade"),
]);

export const teamPerformance = pgTable("team_performance", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	period: text().notNull(),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'string' }).notNull(),
	totalClients: integer("total_clients").default(0).notNull(),
	newClients: integer("new_clients").default(0).notNull(),
	totalMeetings: integer("total_meetings").default(0).notNull(),
	completedMeetings: integer("completed_meetings").default(0).notNull(),
	totalReferrals: integer("total_referrals").default(0).notNull(),
	successfulReferrals: integer("successful_referrals").default(0).notNull(),
	totalRevenue: numeric("total_revenue", { precision: 15, scale:  2 }).default('0').notNull(),
	averageRevenue: numeric("average_revenue", { precision: 12, scale:  2 }).default('0').notNull(),
	conversionRate: numeric("conversion_rate", { precision: 5, scale:  2 }).default('0').notNull(),
	memberCount: integer("member_count").default(0).notNull(),
	activeMembers: integer("active_members").default(0).notNull(),
	topPerformerId: uuid("top_performer_id"),
	metrics: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_performance_team_id_teams_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.topPerformerId],
			foreignColumns: [profiles.id],
			name: "team_performance_top_performer_id_profiles_id_fk"
		}),
]);

export const teamTemplates = pgTable("team_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	teamId: uuid("team_id").notNull(),
	createdBy: uuid("created_by").notNull(),
	name: text().notNull(),
	description: text(),
	type: text().notNull(),
	category: text(),
	template: jsonb().notNull(),
	variables: jsonb(),
	isDefault: boolean("is_default").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	usageCount: integer("usage_count").default(0).notNull(),
	lastUsed: timestamp("last_used", { withTimezone: true, mode: 'string' }),
	tags: text().array(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [profiles.id],
			name: "team_templates_created_by_profiles_id_fk"
		}),
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_templates_team_id_teams_id_fk"
		}).onDelete("cascade"),
]);

export const pageViews = pgTable("page_views", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	path: text().notNull(),
	userAgent: text("user_agent"),
	ipAddress: text("ip_address"),
	referrer: text(),
	sessionId: text("session_id"),
	userId: uuid("user_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "page_views_user_id_profiles_id_fk"
		}),
]);

export const faqs = pgTable("faqs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	question: text().notNull(),
	answer: text().notNull(),
	category: text().default('general').notNull(),
	order: integer().default(0).notNull(),
	isPublished: boolean("is_published").default(true).notNull(),
	language: language().default('ko').notNull(),
	authorId: uuid("author_id"),
	viewCount: integer("view_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [profiles.id],
			name: "faqs_author_id_profiles_id_fk"
		}),
]);

export const publicContents = pgTable("public_contents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	type: contentType().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	version: text().default('1.0').notNull(),
	language: language().default('ko').notNull(),
	status: contentStatus().default('draft').notNull(),
	effectiveDate: timestamp("effective_date", { withTimezone: true, mode: 'string' }),
	expiryDate: timestamp("expiry_date", { withTimezone: true, mode: 'string' }),
	authorId: uuid("author_id"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [profiles.id],
			name: "public_contents_author_id_profiles_id_fk"
		}),
]);

export const siteSettings = pgTable("site_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	key: text().notNull(),
	value: text().notNull(),
	type: text().default('string').notNull(),
	description: text(),
	isPublic: boolean("is_public").default(false).notNull(),
	updatedBy: uuid("updated_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [profiles.id],
			name: "site_settings_updated_by_profiles_id_fk"
		}),
	unique("site_settings_key_unique").on(table.key),
]);

export const testimonials = pgTable("testimonials", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	role: text().notNull(),
	company: text().notNull(),
	quote: text().notNull(),
	rating: integer().default(5).notNull(),
	initial: text().notNull(),
	isVerified: boolean("is_verified").default(false).notNull(),
	isPublished: boolean("is_published").default(false).notNull(),
	order: integer().default(0).notNull(),
	language: language().default('ko').notNull(),
	authorId: uuid("author_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [profiles.id],
			name: "testimonials_author_id_profiles_id_fk"
		}),
]);

export const announcements = pgTable("announcements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	type: text().default('general').notNull(),
	priority: integer().default(0).notNull(),
	isPublished: boolean("is_published").default(false).notNull(),
	isPinned: boolean("is_pinned").default(false).notNull(),
	language: language().default('ko').notNull(),
	authorId: uuid("author_id"),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [profiles.id],
			name: "announcements_author_id_profiles_id_fk"
		}),
]);

export const meetingChecklists = pgTable("meeting_checklists", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	meetingId: uuid("meeting_id").notNull(),
	text: text().notNull(),
	completed: boolean().default(false).notNull(),
	order: integer().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.meetingId],
			foreignColumns: [meetings.id],
			name: "meeting_checklists_meeting_id_meetings_id_fk"
		}).onDelete("cascade"),
]);
