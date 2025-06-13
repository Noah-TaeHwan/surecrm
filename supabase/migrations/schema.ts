import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  unique,
  boolean,
  foreignKey,
  integer,
  numeric,
  date,
  pgPolicy,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const appCalendarExternalSourceEnum = pgEnum(
  'app_calendar_external_source_enum',
  ['local', 'google_calendar', 'outlook', 'apple_calendar']
);
export const appCalendarMeetingStatusEnum = pgEnum(
  'app_calendar_meeting_status_enum',
  ['scheduled', 'completed', 'cancelled', 'rescheduled']
);
export const appCalendarMeetingTypeEnum = pgEnum(
  'app_calendar_meeting_type_enum',
  [
    'first_consultation',
    'product_explanation',
    'contract_review',
    'follow_up',
    'other',
  ]
);
export const appCalendarRecurrenceTypeEnum = pgEnum(
  'app_calendar_recurrence_type_enum',
  ['none', 'daily', 'weekly', 'monthly', 'yearly']
);
export const appCalendarReminderTypeEnum = pgEnum(
  'app_calendar_reminder_type_enum',
  ['none', '5_minutes', '15_minutes', '30_minutes', '1_hour', '1_day']
);
export const appCalendarSyncStatusEnum = pgEnum(
  'app_calendar_sync_status_enum',
  ['not_synced', 'syncing', 'synced', 'sync_failed', 'sync_conflict']
);
export const appCalendarViewEnum = pgEnum('app_calendar_view_enum', [
  'month',
  'week',
  'day',
  'agenda',
]);
export const appChartTypeEnum = pgEnum('app_chart_type_enum', [
  'line',
  'bar',
  'pie',
  'doughnut',
  'area',
  'scatter',
  'funnel',
  'gauge',
]);
export const appClientContactMethodEnum = pgEnum(
  'app_client_contact_method_enum',
  ['phone', 'email', 'kakao', 'sms', 'in_person', 'video_call']
);
export const appClientDataAccessLogTypeEnum = pgEnum(
  'app_client_data_access_log_type_enum',
  ['view', 'edit', 'export', 'share', 'delete']
);
export const appClientPrivacyLevelEnum = pgEnum(
  'app_client_privacy_level_enum',
  ['public', 'restricted', 'private', 'confidential']
);
export const appClientSourceEnum = pgEnum('app_client_source_enum', [
  'referral',
  'cold_call',
  'marketing',
  'website',
  'social_media',
  'event',
  'partner',
  'other',
]);
export const appClientStatusEnum = pgEnum('app_client_status_enum', [
  'prospect',
  'contacted',
  'qualified',
  'proposal_sent',
  'negotiating',
  'closed_won',
  'closed_lost',
  'dormant',
]);
export const appContractDocumentTypeEnum = pgEnum(
  'app_contract_document_type_enum',
  [
    'contract',
    'policy',
    'application',
    'identification',
    'medical_report',
    'vehicle_registration',
    'other_document',
  ]
);
export const appContractStatusEnum = pgEnum('app_contract_status_enum', [
  'draft',
  'active',
  'cancelled',
  'expired',
  'suspended',
]);
export const appDashboardActivityTypeEnum = pgEnum(
  'app_dashboard_activity_type_enum',
  [
    'client_added',
    'client_updated',
    'meeting_scheduled',
    'meeting_completed',
    'meeting_cancelled',
    'referral_received',
    'referral_converted',
    'goal_achieved',
    'stage_changed',
    'document_uploaded',
    'insurance_added',
  ]
);
export const appDashboardGoalPeriodEnum = pgEnum(
  'app_dashboard_goal_period_enum',
  ['monthly', 'quarterly', 'yearly']
);
export const appDashboardGoalTypeEnum = pgEnum('app_dashboard_goal_type_enum', [
  'clients',
  'meetings',
  'revenue',
  'referrals',
  'conversion_rate',
]);
export const appDashboardMetricPeriodEnum = pgEnum(
  'app_dashboard_metric_period_enum',
  ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
);
export const appDashboardNotificationPriorityEnum = pgEnum(
  'app_dashboard_notification_priority_enum',
  ['low', 'normal', 'high', 'urgent']
);
export const appDashboardNotificationTypeEnum = pgEnum(
  'app_dashboard_notification_type_enum',
  [
    'meeting_reminder',
    'goal_achievement',
    'goal_deadline',
    'new_referral',
    'client_milestone',
    'team_update',
    'system_alert',
  ]
);
export const appDashboardWidgetTypeEnum = pgEnum(
  'app_dashboard_widget_type_enum',
  [
    'kpi_card',
    'chart',
    'table',
    'calendar',
    'list',
    'progress',
    'notification',
    'quick_action',
  ]
);
export const appDocumentTypeEnum = pgEnum('app_document_type_enum', [
  'policy',
  'id_card',
  'vehicle_registration',
  'vehicle_photo',
  'dashboard_photo',
  'license_plate_photo',
  'blackbox_photo',
  'insurance_policy_photo',
  'other',
]);
export const appGenderEnum = pgEnum('app_gender_enum', ['male', 'female']);
export const appImportanceEnum = pgEnum('app_importance_enum', [
  'high',
  'medium',
  'low',
]);
export const appInfluencerActivityTypeEnum = pgEnum(
  'app_influencer_activity_type_enum',
  [
    'new_referral',
    'referral_converted',
    'gratitude_sent',
    'meeting_scheduled',
    'tier_upgraded',
    'network_expanded',
    'relationship_strengthened',
  ]
);
export const appInfluencerContactMethodEnum = pgEnum(
  'app_influencer_contact_method_enum',
  ['phone', 'email', 'kakao', 'sms', 'in_person', 'video_call', 'letter']
);
export const appInfluencerDataSourceEnum = pgEnum(
  'app_influencer_data_source_enum',
  ['direct_input', 'auto_calculated', 'imported', 'api_sync']
);
export const appInfluencerGiftTypeEnum = pgEnum(
  'app_influencer_gift_type_enum',
  [
    'flowers',
    'food_voucher',
    'coffee_voucher',
    'traditional_gift',
    'cash_gift',
    'experience_voucher',
    'custom_gift',
    'none',
  ]
);
export const appInfluencerGratitudeStatusEnum = pgEnum(
  'app_influencer_gratitude_status_enum',
  [
    'planned',
    'scheduled',
    'sent',
    'delivered',
    'completed',
    'cancelled',
    'failed',
  ]
);
export const appInfluencerGratitudeTypeEnum = pgEnum(
  'app_influencer_gratitude_type_enum',
  [
    'thank_you_call',
    'thank_you_message',
    'gift_delivery',
    'meal_invitation',
    'event_invitation',
    'holiday_greetings',
    'birthday_wishes',
    'custom',
  ]
);
export const appInfluencerTierEnum = pgEnum('app_influencer_tier_enum', [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
]);
export const appInsuranceTypeEnum = pgEnum('app_insurance_type_enum', [
  'life',
  'health',
  'auto',
  'prenatal',
  'property',
  'other',
]);
export const appInvitationStatusEnum = pgEnum('app_invitation_status_enum', [
  'pending',
  'used',
  'expired',
  'cancelled',
]);
export const appMeetingStatusEnum = pgEnum('app_meeting_status_enum', [
  'scheduled',
  'completed',
  'cancelled',
  'rescheduled',
]);
export const appMeetingTypeEnum = pgEnum('app_meeting_type_enum', [
  'first_consultation',
  'product_explanation',
  'contract_review',
  'follow_up',
  'other',
]);
export const appNetworkAnalysisTypeEnum = pgEnum(
  'app_network_analysis_type_enum',
  [
    'centrality',
    'clustering',
    'path_analysis',
    'influence_mapping',
    'growth_tracking',
  ]
);
export const appNetworkConnectionTypeEnum = pgEnum(
  'app_network_connection_type_enum',
  [
    'direct_referral',
    'family_member',
    'colleague',
    'friend',
    'business_partner',
    'community_member',
  ]
);
export const appNetworkNodeTypeEnum = pgEnum('app_network_node_type_enum', [
  'client',
  'prospect',
  'influencer',
  'partner',
  'external',
]);
export const appNotificationChannelEnum = pgEnum(
  'app_notification_channel_enum',
  ['in_app', 'email', 'sms', 'push', 'kakao']
);
export const appNotificationPriorityEnum = pgEnum(
  'app_notification_priority_enum',
  ['low', 'normal', 'high', 'urgent']
);
export const appNotificationStatusEnum = pgEnum(
  'app_notification_status_enum',
  ['pending', 'sent', 'delivered', 'read', 'failed', 'cancelled']
);
export const appNotificationTypeEnum = pgEnum('app_notification_type_enum', [
  'meeting_reminder',
  'goal_achievement',
  'goal_deadline',
  'new_referral',
  'client_milestone',
  'team_update',
  'system_alert',
  'birthday_reminder',
  'follow_up_reminder',
  'contract_expiry',
  'payment_due',
]);
export const appPipelineAutomationActionEnum = pgEnum(
  'app_pipeline_automation_action_enum',
  [
    'send_notification',
    'create_task',
    'schedule_meeting',
    'move_to_stage',
    'assign_to_user',
    'send_email',
  ]
);
export const appPipelineAutomationTriggerEnum = pgEnum(
  'app_pipeline_automation_trigger_enum',
  [
    'stage_entry',
    'stage_exit',
    'time_in_stage',
    'client_created',
    'meeting_scheduled',
    'document_uploaded',
  ]
);
export const appPipelineStageActionTypeEnum = pgEnum(
  'app_pipeline_stage_action_type_enum',
  [
    'moved_to_stage',
    'stage_created',
    'stage_updated',
    'stage_deleted',
    'bulk_move',
    'automation_triggered',
  ]
);
export const appPipelineViewTypeEnum = pgEnum('app_pipeline_view_type_enum', [
  'kanban',
  'list',
  'table',
  'timeline',
  'funnel',
]);
export const appReferralStatusEnum = pgEnum('app_referral_status_enum', [
  'active',
  'inactive',
]);
export const appReportFormatEnum = pgEnum('app_report_format_enum', [
  'pdf',
  'excel',
  'csv',
  'json',
  'html',
]);
export const appReportFrequencyEnum = pgEnum('app_report_frequency_enum', [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'on_demand',
]);
export const appReportStatusEnum = pgEnum('app_report_status_enum', [
  'pending',
  'generating',
  'completed',
  'failed',
  'cancelled',
]);
export const appReportTypeEnum = pgEnum('app_report_type_enum', [
  'performance',
  'pipeline',
  'client_analysis',
  'referral_analysis',
  'meeting_analysis',
  'revenue',
  'conversion',
  'activity',
  'custom',
]);
export const appSettingsCategory = pgEnum('app_settings_category', [
  'profile',
  'notifications',
  'system',
  'security',
  'integrations',
]);
export const appSettingsIntegrationStatus = pgEnum(
  'app_settings_integration_status',
  ['active', 'inactive', 'error', 'pending']
);
export const appSettingsIntegrationType = pgEnum(
  'app_settings_integration_type',
  ['kakao_talk', 'google_calendar', 'email', 'sms']
);
export const appSettingsNotificationChannel = pgEnum(
  'app_settings_notification_channel',
  ['email', 'sms', 'push', 'kakao']
);
export const appTeamActivityTypeEnum = pgEnum('app_team_activity_type_enum', [
  'member_joined',
  'member_left',
  'member_promoted',
  'member_demoted',
  'goal_created',
  'goal_achieved',
  'meeting_scheduled',
  'performance_milestone',
]);
export const appTeamMemberRoleEnum = pgEnum('app_team_member_role_enum', [
  'member',
  'manager',
  'admin',
]);
export const appTeamMemberStatusEnum = pgEnum('app_team_member_status_enum', [
  'active',
  'inactive',
  'pending',
]);
export const appThemeEnum = pgEnum('app_theme_enum', ['light', 'dark']);
export const appUserRoleEnum = pgEnum('app_user_role_enum', [
  'agent',
  'team_admin',
  'system_admin',
]);
export const invitationSource = pgEnum('invitation_source', [
  'direct_link',
  'email',
  'sms',
  'kakao_talk',
  'qr_code',
  'referral_bonus',
]);
export const invitationType = pgEnum('invitation_type', [
  'standard',
  'premium',
  'team_admin',
  'beta_tester',
]);
export const publicContentStatusEnum = pgEnum('public_content_status_enum', [
  'draft',
  'published',
  'archived',
]);
export const publicContentTypeEnum = pgEnum('public_content_type_enum', [
  'terms_of_service',
  'privacy_policy',
  'faq',
  'announcement',
  'help_article',
]);
export const publicLanguageEnum = pgEnum('public_language_enum', [
  'ko',
  'en',
  'ja',
  'zh',
]);
export const usageAction = pgEnum('usage_action', [
  'viewed',
  'clicked',
  'registered',
  'completed',
]);
export const waitlistStatus = pgEnum('waitlist_status', [
  'waiting',
  'invited',
  'registered',
  'rejected',
]);

export const adminSystemAuditLogs = pgTable('admin_system_audit_logs', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  adminId: uuid('admin_id').notNull(),
  action: text().notNull(),
  tableName: text('table_name'),
  targetId: text('target_id'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

export const appAdminSessions = pgTable(
  'app_admin_sessions',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    adminId: uuid('admin_id').notNull(),
    sessionToken: text('session_token').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    lastActivity: timestamp('last_activity', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    unique('app_admin_sessions_session_token_unique').on(table.sessionToken),
  ]
);

export const appAdminDashboardWidgets = pgTable('app_admin_dashboard_widgets', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  adminId: uuid('admin_id').notNull(),
  widgetType: text('widget_type').notNull(),
  title: text().notNull(),
  config: jsonb().notNull(),
  position: jsonb().notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

export const appAdminSecurityAlerts = pgTable('app_admin_security_alerts', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  adminId: uuid('admin_id'),
  alertType: text('alert_type').notNull(),
  severity: text().notNull(),
  title: text().notNull(),
  description: text(),
  metadata: jsonb(),
  isResolved: boolean('is_resolved').default(false).notNull(),
  resolvedById: uuid('resolved_by_id'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'string' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

export const appClientDocuments = pgTable(
  'app_client_documents',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    insuranceInfoId: uuid('insurance_info_id'),
    agentId: uuid('agent_id').notNull(),
    documentType: appDocumentTypeEnum('document_type').notNull(),
    fileName: text('file_name').notNull(),
    filePath: text('file_path').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer().notNull(),
    description: text(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_documents_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_documents_client_id_app_client_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.insuranceInfoId],
      foreignColumns: [appClientInsurance.id],
      name: 'app_client_documents_insurance_info_id_app_client_insurance_id_',
    }),
  ]
);

export const appPipelineAutomations = pgTable(
  'app_pipeline_automations',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    teamId: uuid('team_id'),
    name: text().notNull(),
    description: text(),
    trigger: appPipelineAutomationTriggerEnum().notNull(),
    triggerConditions: jsonb('trigger_conditions').notNull(),
    actions: jsonb().notNull(),
    stageId: uuid('stage_id'),
    isActive: boolean('is_active').default(true).notNull(),
    executionCount: integer('execution_count').default(0).notNull(),
    lastExecuted: timestamp('last_executed', {
      withTimezone: true,
      mode: 'string',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.stageId],
      foreignColumns: [appPipelineStages.id],
      name: 'app_pipeline_automations_stage_id_app_pipeline_stages_id_fk',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_pipeline_automations_team_id_app_user_teams_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_pipeline_automations_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appPipelineGoals = pgTable(
  'app_pipeline_goals',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    teamId: uuid('team_id'),
    stageId: uuid('stage_id'),
    name: text().notNull(),
    description: text(),
    targetType: text('target_type').notNull(),
    targetValue: numeric('target_value', { precision: 10, scale: 2 }).notNull(),
    currentValue: numeric('current_value', { precision: 10, scale: 2 }).default(
      '0'
    ),
    period: text().notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.stageId],
      foreignColumns: [appPipelineStages.id],
      name: 'app_pipeline_goals_stage_id_app_pipeline_stages_id_fk',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_pipeline_goals_team_id_app_user_teams_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_pipeline_goals_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appPipelineStageHistory = pgTable(
  'app_pipeline_stage_history',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    fromStageId: uuid('from_stage_id'),
    toStageId: uuid('to_stage_id').notNull(),
    changedBy: uuid('changed_by').notNull(),
    actionType: appPipelineStageActionTypeEnum('action_type').notNull(),
    reason: text(),
    notes: text(),
    timeInPreviousStage: integer('time_in_previous_stage'),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.changedBy],
      foreignColumns: [appUserProfiles.id],
      name: 'app_pipeline_stage_history_changed_by_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_pipeline_stage_history_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.fromStageId],
      foreignColumns: [appPipelineStages.id],
      name: 'app_pipeline_stage_history_from_stage_id_app_pipeline_stages_id',
    }),
    foreignKey({
      columns: [table.toStageId],
      foreignColumns: [appPipelineStages.id],
      name: 'app_pipeline_stage_history_to_stage_id_app_pipeline_stages_id_f',
    }),
  ]
);

export const appPipelineStageTemplates = pgTable(
  'app_pipeline_stage_templates',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id'),
    teamId: uuid('team_id'),
    name: text().notNull(),
    description: text(),
    category: text(),
    stages: jsonb().notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    isPublic: boolean('is_public').default(false).notNull(),
    usageCount: integer('usage_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_pipeline_stage_templates_team_id_app_user_teams_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_pipeline_stage_templates_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appPipelineViews = pgTable(
  'app_pipeline_views',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    teamId: uuid('team_id'),
    name: text().notNull(),
    description: text(),
    viewType: appPipelineViewTypeEnum('view_type').default('kanban').notNull(),
    filters: jsonb(),
    sortBy: text('sort_by').default('created_at'),
    sortOrder: text('sort_order').default('desc'),
    groupBy: text('group_by'),
    visibleStages: text('visible_stages').array(),
    columnSettings: jsonb('column_settings'),
    isDefault: boolean('is_default').default(false).notNull(),
    isPublic: boolean('is_public').default(false).notNull(),
    usageCount: integer('usage_count').default(0).notNull(),
    lastUsed: timestamp('last_used', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_pipeline_views_team_id_app_user_teams_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_pipeline_views_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appClientInsuranceContracts = pgTable(
  'app_client_insurance_contracts',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    opportunityProductId: uuid('opportunity_product_id'),
    productName: text('product_name').notNull(),
    insuranceCompany: text('insurance_company').notNull(),
    insuranceType: appInsuranceTypeEnum('insurance_type').notNull(),
    contractNumber: text('contract_number'),
    policyNumber: text('policy_number'),
    contractDate: date('contract_date').notNull(),
    effectiveDate: date('effective_date').notNull(),
    expirationDate: date('expiration_date'),
    contractorName: text('contractor_name').notNull(),
    insuredName: text('insured_name').notNull(),
    beneficiaryName: text('beneficiary_name'),
    monthlyPremium: numeric('monthly_premium', { precision: 12, scale: 2 }),
    annualPremium: numeric('annual_premium', { precision: 12, scale: 2 }),
    coverageAmount: numeric('coverage_amount', { precision: 15, scale: 2 }),
    agentCommission: numeric('agent_commission', { precision: 12, scale: 2 }),
    status: appContractStatusEnum().default('active').notNull(),
    isRenewalContract: boolean('is_renewal_contract').default(false).notNull(),
    parentContractId: uuid('parent_contract_id'),
    specialClauses: text('special_clauses'),
    paymentMethod: text('payment_method'),
    paymentPeriod: integer('payment_period'),
    notes: text(),
    internalNotes: text('internal_notes'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_insurance_contracts_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_insurance_contracts_client_id_app_client_profiles_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.opportunityProductId],
      foreignColumns: [appOpportunityProducts.id],
      name: 'app_client_insurance_contracts_opportunity_product_id_app_oppor',
    }),
  ]
);

export const appClientContractAttachments = pgTable(
  'app_client_contract_attachments',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    contractId: uuid('contract_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    fileName: text('file_name').notNull(),
    fileDisplayName: text('file_display_name').notNull(),
    filePath: text('file_path').notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: text('mime_type').notNull(),
    documentType: appContractDocumentTypeEnum('document_type').notNull(),
    description: text(),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    isActive: boolean('is_active').default(true).notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_contract_attachments_agent_id_app_user_profiles_id_f',
    }),
    foreignKey({
      columns: [table.contractId],
      foreignColumns: [appClientInsuranceContracts.id],
      name: 'app_client_contract_attachments_contract_id_app_client_insuranc',
    }).onDelete('cascade'),
  ]
);

export const appClientMeetings = pgTable(
  'app_client_meetings',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    title: text().notNull(),
    description: text(),
    meetingType: appMeetingTypeEnum('meeting_type').notNull(),
    status: appMeetingStatusEnum().default('scheduled').notNull(),
    scheduledAt: timestamp('scheduled_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    duration: integer().default(60).notNull(),
    location: text(),
    googleMeetLink: text('google_meet_link'),
    notes: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_meetings_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_meetings_client_id_app_client_profiles_id_fk',
    }),
  ]
);

export const appClientReferrals = pgTable(
  'app_client_referrals',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    referrerId: uuid('referrer_id').notNull(),
    referredId: uuid('referred_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    referralDate: date('referral_date').defaultNow().notNull(),
    status: appReferralStatusEnum().default('active').notNull(),
    notes: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_referrals_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.referredId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_referrals_referred_id_app_client_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.referrerId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_referrals_referrer_id_app_client_profiles_id_fk',
    }),
  ]
);

export const appClientInsurance = pgTable(
  'app_client_insurance',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    insuranceType: appInsuranceTypeEnum('insurance_type').notNull(),
    policyNumber: text('policy_number'),
    insurer: text(),
    premium: numeric({ precision: 10, scale: 2 }),
    coverageAmount: numeric('coverage_amount', { precision: 12, scale: 2 }),
    startDate: date('start_date'),
    endDate: date('end_date'),
    beneficiary: text(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_insurance_client_id_app_client_profiles_id_fk',
    }),
  ]
);

export const appClientDetails = pgTable(
  'app_client_details',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    ssn: text(),
    birthDate: date('birth_date'),
    gender: appGenderEnum(),
    bankAccount: text('bank_account'),
    emergencyContact: text('emergency_contact'),
    emergencyPhone: text('emergency_phone'),
    medicalHistory: text('medical_history'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_details_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
    unique('app_client_details_client_id_unique').on(table.clientId),
    pgPolicy('Users can delete own client details', {
      as: 'permissive',
      for: 'delete',
      to: ['public'],
      using: sql`(client_id IN ( SELECT app_client_profiles.id
   FROM app_client_profiles
  WHERE (app_client_profiles.agent_id = auth.uid())))`,
    }),
    pgPolicy('Users can insert own client details', {
      as: 'permissive',
      for: 'insert',
      to: ['public'],
    }),
    pgPolicy('Users can update own client details', {
      as: 'permissive',
      for: 'update',
      to: ['public'],
    }),
    pgPolicy('Users can view own client details', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
    }),
  ]
);

export const appOpportunityProducts = pgTable(
  'app_opportunity_products',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    productName: text('product_name').notNull(),
    insuranceCompany: text('insurance_company').notNull(),
    insuranceType: appInsuranceTypeEnum('insurance_type').notNull(),
    monthlyPremium: numeric('monthly_premium', { precision: 12, scale: 2 }),
    expectedCommission: numeric('expected_commission', {
      precision: 12,
      scale: 2,
    }),
    notes: text(),
    status: text().default('active').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_opportunity_products_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_opportunity_products_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appCalendarMeetingAttendees = pgTable(
  'app_calendar_meeting_attendees',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    meetingId: uuid('meeting_id').notNull(),
    clientId: uuid('client_id'),
    agentId: uuid('agent_id'),
    externalEmail: text('external_email'),
    externalName: text('external_name'),
    status: text().default('pending').notNull(),
    responseAt: timestamp('response_at', {
      withTimezone: true,
      mode: 'string',
    }),
    googleCalendarAttendeeId: text('google_calendar_attendee_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_calendar_meeting_attendees_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_calendar_meeting_attendees_client_id_app_client_profiles_id',
    }),
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [appClientMeetings.id],
      name: 'app_calendar_meeting_attendees_meeting_id_app_client_meetings_i',
    }).onDelete('cascade'),
  ]
);

export const appCalendarMeetingChecklists = pgTable(
  'app_calendar_meeting_checklists',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    meetingId: uuid('meeting_id').notNull(),
    text: text().notNull(),
    completed: boolean().default(false).notNull(),
    order: integer().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [appClientMeetings.id],
      name: 'app_calendar_meeting_checklists_meeting_id_app_client_meetings_',
    }).onDelete('cascade'),
  ]
);

export const appCalendarMeetingNotes = pgTable(
  'app_calendar_meeting_notes',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    meetingId: uuid('meeting_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    content: text().notNull(),
    isPrivate: boolean('is_private').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_calendar_meeting_notes_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [appClientMeetings.id],
      name: 'app_calendar_meeting_notes_meeting_id_app_client_meetings_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appCalendarMeetingReminders = pgTable(
  'app_calendar_meeting_reminders',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    meetingId: uuid('meeting_id').notNull(),
    reminderType: appCalendarReminderTypeEnum('reminder_type').notNull(),
    reminderTime: timestamp('reminder_time', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    isSent: boolean('is_sent').default(false).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    googleCalendarReminderId: text('google_calendar_reminder_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [appClientMeetings.id],
      name: 'app_calendar_meeting_reminders_meeting_id_app_client_meetings_i',
    }).onDelete('cascade'),
  ]
);

export const appCalendarRecurringMeetings = pgTable(
  'app_calendar_recurring_meetings',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    parentMeetingId: uuid('parent_meeting_id').notNull(),
    recurrenceType: appCalendarRecurrenceTypeEnum('recurrence_type').notNull(),
    recurrenceInterval: integer('recurrence_interval').default(1).notNull(),
    recurrenceEnd: timestamp('recurrence_end', {
      withTimezone: true,
      mode: 'string',
    }),
    maxOccurrences: integer('max_occurrences'),
    exceptions: jsonb(),
    googleCalendarRecurrenceId: text('google_calendar_recurrence_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.parentMeetingId],
      foreignColumns: [appClientMeetings.id],
      name: 'app_calendar_recurring_meetings_parent_meeting_id_app_client_me',
    }),
  ]
);

export const appCalendarSyncLogs = pgTable(
  'app_calendar_sync_logs',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    meetingId: uuid('meeting_id'),
    syncDirection: text('sync_direction').notNull(),
    syncStatus: appCalendarSyncStatusEnum('sync_status').notNull(),
    externalSource: appCalendarExternalSourceEnum('external_source').notNull(),
    externalEventId: text('external_event_id'),
    syncResult: jsonb('sync_result'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_calendar_sync_logs_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [appClientMeetings.id],
      name: 'app_calendar_sync_logs_meeting_id_app_client_meetings_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appInfluencerGratitudeHistory = pgTable(
  'app_influencer_gratitude_history',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    influencerId: uuid('influencer_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    referralId: uuid('referral_id'),
    gratitudeType: appInfluencerGratitudeTypeEnum('gratitude_type').notNull(),
    giftType: appInfluencerGiftTypeEnum('gift_type').default('none').notNull(),
    title: text().notNull(),
    message: text().notNull(),
    personalizedMessage: text('personalized_message'),
    scheduledDate: date('scheduled_date'),
    sentDate: date('sent_date'),
    deliveredDate: date('delivered_date'),
    status: appInfluencerGratitudeStatusEnum().default('planned').notNull(),
    cost: numeric({ precision: 10, scale: 2 }).default('0'),
    vendor: text(),
    trackingNumber: text('tracking_number'),
    recipientFeedback: text('recipient_feedback'),
    internalNotes: text('internal_notes'),
    isRecurring: boolean('is_recurring').default(false).notNull(),
    recurringInterval: integer('recurring_interval'),
    nextScheduledDate: date('next_scheduled_date'),
    metadata: jsonb(),
    isAutoGenerated: boolean('is_auto_generated').default(false).notNull(),
    templateId: text('template_id'),
    sentiment: text(),
    deliveryConfirmed: boolean('delivery_confirmed').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_influencer_gratitude_history_agent_id_app_user_profiles_id_',
    }),
    foreignKey({
      columns: [table.influencerId],
      foreignColumns: [appInfluencerProfiles.id],
      name: 'app_influencer_gratitude_history_influencer_id_app_influencer_p',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.referralId],
      foreignColumns: [appClientReferrals.id],
      name: 'app_influencer_gratitude_history_referral_id_app_client_referra',
    }),
  ]
);

export const appClientProfiles = pgTable(
  'app_client_profiles',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    teamId: uuid('team_id'),
    fullName: text('full_name').notNull(),
    email: text(),
    phone: text().notNull(),
    telecomProvider: text('telecom_provider'),
    address: text(),
    occupation: text(),
    hasDrivingLicense: boolean('has_driving_license'),
    height: integer(),
    weight: integer(),
    tags: text().array(),
    importance: appImportanceEnum().default('medium').notNull(),
    currentStageId: uuid('current_stage_id').notNull(),
    referredById: uuid('referred_by_id'),
    notes: text(),
    customFields: jsonb('custom_fields'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    stageOrder: integer('stage_order').default(0).notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_profiles_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.currentStageId],
      foreignColumns: [appPipelineStages.id],
      name: 'app_client_profiles_current_stage_id_app_pipeline_stages_id_fk',
    }),
    foreignKey({
      columns: [table.referredById],
      foreignColumns: [table.id],
      name: 'app_client_profiles_referred_by_id_app_client_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_client_profiles_team_id_app_user_teams_id_fk',
    }),
  ]
);

export const appUserInvitations = pgTable(
  'app_user_invitations',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    code: text().notNull(),
    inviterId: uuid('inviter_id').notNull(),
    inviteeEmail: text('invitee_email'),
    message: text(),
    status: appInvitationStatusEnum().default('pending').notNull(),
    usedById: uuid('used_by_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
    usedAt: timestamp('used_at', { withTimezone: true, mode: 'string' }),
  },
  table => [
    foreignKey({
      columns: [table.inviterId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_user_invitations_inviter_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.usedById],
      foreignColumns: [appUserProfiles.id],
      name: 'app_user_invitations_used_by_id_app_user_profiles_id_fk',
    }),
    unique('app_user_invitations_code_unique').on(table.code),
  ]
);

export const appPipelineStages = pgTable(
  'app_pipeline_stages',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id'),
    teamId: uuid('team_id'),
    name: text().notNull(),
    order: integer().notNull(),
    color: text().notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_pipeline_stages_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_pipeline_stages_team_id_app_user_teams_id_fk',
    }),
  ]
);

export const appClientAnalytics = pgTable(
  'app_client_analytics',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    totalContacts: integer('total_contacts').default(0),
    lastContactDate: timestamp('last_contact_date', {
      withTimezone: true,
      mode: 'string',
    }),
    averageResponseTime: integer('average_response_time'),
    engagementScore: numeric('engagement_score', { precision: 5, scale: 2 }),
    conversionProbability: numeric('conversion_probability', {
      precision: 5,
      scale: 2,
    }),
    lifetimeValue: numeric('lifetime_value', { precision: 12, scale: 2 }),
    acquisitionCost: numeric('acquisition_cost', { precision: 10, scale: 2 }),
    referralCount: integer('referral_count').default(0),
    referralValue: numeric('referral_value', { precision: 12, scale: 2 }),
    lastAnalyzedAt: timestamp('last_analyzed_at', {
      withTimezone: true,
      mode: 'string',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_analytics_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
    unique('app_client_analytics_client_id_unique').on(table.clientId),
  ]
);

export const appClientContactHistory = pgTable(
  'app_client_contact_history',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    contactMethod: appClientContactMethodEnum('contact_method').notNull(),
    subject: text(),
    content: text(),
    duration: integer(),
    outcome: text(),
    nextAction: text('next_action'),
    nextActionDate: timestamp('next_action_date', {
      withTimezone: true,
      mode: 'string',
    }),
    attachments: jsonb(),
    privacyLevel: appClientPrivacyLevelEnum('privacy_level')
      .default('restricted')
      .notNull(),
    isConfidential: boolean('is_confidential').default(false).notNull(),
    accessibleBy: text('accessible_by').array(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_contact_history_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_contact_history_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appClientDataAccessLogs = pgTable(
  'app_client_data_access_logs',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    accessedBy: uuid('accessed_by').notNull(),
    accessType: appClientDataAccessLogTypeEnum('access_type').notNull(),
    accessedData: text('accessed_data').array(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    purpose: text(),
    accessResult: text('access_result'),
    metadata: jsonb(),
    accessedAt: timestamp('accessed_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.accessedBy],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_data_access_logs_accessed_by_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_data_access_logs_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appClientDataBackups = pgTable(
  'app_client_data_backups',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    backupType: text('backup_type').notNull(),
    backupData: jsonb('backup_data').notNull(),
    backupHash: text('backup_hash').notNull(),
    triggeredBy: uuid('triggered_by').notNull(),
    triggerReason: text('trigger_reason'),
    retentionUntil: timestamp('retention_until', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    isEncrypted: boolean('is_encrypted').default(true).notNull(),
    encryptionKey: text('encryption_key'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_data_backups_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.triggeredBy],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_data_backups_triggered_by_app_user_profiles_id_fk',
    }),
  ]
);

export const appClientFamilyMembers = pgTable(
  'app_client_family_members',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    name: text().notNull(),
    relationship: text().notNull(),
    birthDate: timestamp('birth_date', { withTimezone: true, mode: 'string' }),
    gender: text(),
    occupation: text(),
    phone: text(),
    email: text(),
    hasInsurance: boolean('has_insurance').default(false),
    insuranceDetails: jsonb('insurance_details'),
    notes: text(),
    privacyLevel: appClientPrivacyLevelEnum('privacy_level')
      .default('confidential')
      .notNull(),
    consentDate: timestamp('consent_date', {
      withTimezone: true,
      mode: 'string',
    }),
    consentExpiry: timestamp('consent_expiry', {
      withTimezone: true,
      mode: 'string',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_family_members_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appClientMilestones = pgTable(
  'app_client_milestones',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    title: text().notNull(),
    description: text(),
    category: text(),
    value: numeric({ precision: 12, scale: 2 }),
    achievedAt: timestamp('achieved_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    isSignificant: boolean('is_significant').default(false).notNull(),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_milestones_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_milestones_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appClientPreferences = pgTable(
  'app_client_preferences',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    preferredContactMethod: appClientContactMethodEnum(
      'preferred_contact_method'
    ).default('phone'),
    preferredContactTime: jsonb('preferred_contact_time'),
    communicationStyle: text('communication_style'),
    interests: text().array(),
    concerns: text().array(),
    budget: jsonb(),
    riskTolerance: text('risk_tolerance'),
    investmentGoals: text('investment_goals').array(),
    specialNeeds: text('special_needs'),
    notes: text(),
    marketingConsent: boolean('marketing_consent').default(false).notNull(),
    dataProcessingConsent: boolean('data_processing_consent')
      .default(true)
      .notNull(),
    thirdPartyShareConsent: boolean('third_party_share_consent')
      .default(false)
      .notNull(),
    privacyLevel: appClientPrivacyLevelEnum('privacy_level')
      .default('private')
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_preferences_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
    unique('app_client_preferences_client_id_unique').on(table.clientId),
  ]
);

export const appClientStageHistory = pgTable(
  'app_client_stage_history',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    fromStageId: uuid('from_stage_id'),
    toStageId: uuid('to_stage_id').notNull(),
    reason: text(),
    notes: text(),
    changedAt: timestamp('changed_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_stage_history_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_stage_history_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.fromStageId],
      foreignColumns: [appPipelineStages.id],
      name: 'app_client_stage_history_from_stage_id_app_pipeline_stages_id_f',
    }),
    foreignKey({
      columns: [table.toStageId],
      foreignColumns: [appPipelineStages.id],
      name: 'app_client_stage_history_to_stage_id_app_pipeline_stages_id_fk',
    }),
  ]
);

export const appClientTagAssignments = pgTable(
  'app_client_tag_assignments',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    tagId: uuid('tag_id').notNull(),
    assignedBy: uuid('assigned_by').notNull(),
    assignedAt: timestamp('assigned_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.assignedBy],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_tag_assignments_assigned_by_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_tag_assignments_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.tagId],
      foreignColumns: [appClientTags.id],
      name: 'app_client_tag_assignments_tag_id_app_client_tags_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appInfluencerProfiles = pgTable(
  'app_influencer_profiles',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    tier: appInfluencerTierEnum().default('bronze').notNull(),
    totalReferrals: integer('total_referrals').default(0).notNull(),
    successfulReferrals: integer('successful_referrals').default(0).notNull(),
    conversionRate: numeric('conversion_rate', { precision: 5, scale: 2 })
      .default('0')
      .notNull(),
    totalContractValue: numeric('total_contract_value', {
      precision: 15,
      scale: 2,
    })
      .default('0')
      .notNull(),
    averageContractValue: numeric('average_contract_value', {
      precision: 12,
      scale: 2,
    })
      .default('0')
      .notNull(),
    networkDepth: integer('network_depth').default(0).notNull(),
    networkWidth: integer('network_width').default(0).notNull(),
    relationshipStrength: numeric('relationship_strength', {
      precision: 3,
      scale: 2,
    })
      .default('0')
      .notNull(),
    lastReferralDate: date('last_referral_date'),
    lastGratitudeDate: date('last_gratitude_date'),
    lastContactDate: date('last_contact_date'),
    preferredContactMethod: appInfluencerContactMethodEnum(
      'preferred_contact_method'
    ),
    specialNotes: text('special_notes'),
    isActive: boolean('is_active').default(true).notNull(),
    dataSource: appInfluencerDataSourceEnum('data_source')
      .default('auto_calculated')
      .notNull(),
    dataVersion: integer('data_version').default(1).notNull(),
    lastCalculatedAt: timestamp('last_calculated_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    isDataVerified: boolean('is_data_verified').default(false).notNull(),
    verifiedAt: timestamp('verified_at', {
      withTimezone: true,
      mode: 'string',
    }),
    verifiedBy: uuid('verified_by'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_influencer_profiles_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_influencer_profiles_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.verifiedBy],
      foreignColumns: [appUserProfiles.id],
      name: 'app_influencer_profiles_verified_by_app_user_profiles_id_fk',
    }),
    unique('app_influencer_profiles_client_id_unique').on(table.clientId),
  ]
);

export const appInvitationUsageLogs = pgTable(
  'app_invitation_usage_logs',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    invitationId: uuid('invitation_id').notNull(),
    userId: uuid('user_id'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    action: usageAction().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.invitationId],
      foreignColumns: [appUserInvitations.id],
      name: 'app_invitation_usage_logs_invitation_id_app_user_invitations_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_invitation_usage_logs_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appNetworkNodes = pgTable(
  'app_network_nodes',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    clientId: uuid('client_id'),
    nodeType: appNetworkNodeTypeEnum('node_type').notNull(),
    name: text().notNull(),
    email: text(),
    phone: text(),
    company: text(),
    position: text(),
    location: text(),
    tags: text().array(),
    centralityScore: numeric('centrality_score', {
      precision: 8,
      scale: 4,
    }).default('0'),
    influenceScore: numeric('influence_score', {
      precision: 8,
      scale: 4,
    }).default('0'),
    connectionsCount: integer('connections_count').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_network_nodes_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_network_nodes_client_id_app_client_profiles_id_fk',
    }),
  ]
);

export const appPipelineAnalytics = pgTable(
  'app_pipeline_analytics',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    teamId: uuid('team_id'),
    date: date().notNull(),
    stageId: uuid('stage_id').notNull(),
    clientsEntered: integer('clients_entered').default(0).notNull(),
    clientsExited: integer('clients_exited').default(0).notNull(),
    clientsRemaining: integer('clients_remaining').default(0).notNull(),
    averageTimeInStage: numeric('average_time_in_stage', {
      precision: 8,
      scale: 2,
    }),
    conversionRate: numeric('conversion_rate', { precision: 5, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.stageId],
      foreignColumns: [appPipelineStages.id],
      name: 'app_pipeline_analytics_stage_id_app_pipeline_stages_id_fk',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_pipeline_analytics_team_id_app_user_teams_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_pipeline_analytics_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appClientCheckupPurposes = pgTable(
  'app_client_checkup_purposes',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    isInsurancePremiumConcern: boolean('is_insurance_premium_concern')
      .default(false)
      .notNull(),
    isCoverageConcern: boolean('is_coverage_concern').default(false).notNull(),
    isMedicalHistoryConcern: boolean('is_medical_history_concern')
      .default(false)
      .notNull(),
    needsDeathBenefit: boolean('needs_death_benefit').default(false).notNull(),
    needsImplantPlan: boolean('needs_implant_plan').default(false).notNull(),
    needsCaregiverInsurance: boolean('needs_caregiver_insurance')
      .default(false)
      .notNull(),
    needsDementiaInsurance: boolean('needs_dementia_insurance')
      .default(false)
      .notNull(),
    currentSavingsLocation: text('current_savings_location'),
    additionalConcerns: text('additional_concerns'),
    priorityLevel: text('priority_level'),
    lastUpdatedBy: uuid('last_updated_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_checkup_purposes_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.lastUpdatedBy],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_checkup_purposes_last_updated_by_app_user_profiles_i',
    }),
    unique('app_client_checkup_purposes_client_id_unique').on(table.clientId),
  ]
);

export const appClientConsultationCompanions = pgTable(
  'app_client_consultation_companions',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    name: text().notNull(),
    phone: text().notNull(),
    relationship: text().notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    privacyLevel: appClientPrivacyLevelEnum('privacy_level')
      .default('restricted')
      .notNull(),
    consentDate: timestamp('consent_date', {
      withTimezone: true,
      mode: 'string',
    }),
    consentExpiry: timestamp('consent_expiry', {
      withTimezone: true,
      mode: 'string',
    }),
    addedBy: uuid('added_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.addedBy],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_consultation_companions_added_by_app_user_profiles_i',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_consultation_companions_client_id_app_client_profile',
    }).onDelete('cascade'),
  ]
);

export const appClientConsultationNotes = pgTable(
  'app_client_consultation_notes',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    consultationDate: date('consultation_date').notNull(),
    noteType: text('note_type').notNull(),
    title: text().notNull(),
    content: text().notNull(),
    contractDetails: jsonb('contract_details'),
    followUpDate: date('follow_up_date'),
    followUpNotes: text('follow_up_notes'),
    importance: text().default('medium').notNull(),
    category: text(),
    tags: text().array(),
    attachments: jsonb(),
    relatedContacts: text('related_contacts').array(),
    privacyLevel: appClientPrivacyLevelEnum('privacy_level')
      .default('restricted')
      .notNull(),
    isConfidential: boolean('is_confidential').default(false).notNull(),
    accessibleBy: text('accessible_by').array(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_consultation_notes_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_consultation_notes_client_id_app_client_profiles_id_',
    }).onDelete('cascade'),
  ]
);

export const appClientInterestCategories = pgTable(
  'app_client_interest_categories',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    interestedInAutoInsurance: boolean('interested_in_auto_insurance')
      .default(false)
      .notNull(),
    interestedInDementia: boolean('interested_in_dementia')
      .default(false)
      .notNull(),
    interestedInDental: boolean('interested_in_dental')
      .default(false)
      .notNull(),
    interestedInDriverInsurance: boolean('interested_in_driver_insurance')
      .default(false)
      .notNull(),
    interestedInHealthCheckup: boolean('interested_in_health_checkup')
      .default(false)
      .notNull(),
    interestedInMedicalExpenses: boolean('interested_in_medical_expenses')
      .default(false)
      .notNull(),
    interestedInFireInsurance: boolean('interested_in_fire_insurance')
      .default(false)
      .notNull(),
    interestedInCaregiver: boolean('interested_in_caregiver')
      .default(false)
      .notNull(),
    interestedInCancer: boolean('interested_in_cancer')
      .default(false)
      .notNull(),
    interestedInSavings: boolean('interested_in_savings')
      .default(false)
      .notNull(),
    interestedInLiability: boolean('interested_in_liability')
      .default(false)
      .notNull(),
    interestedInLegalAdvice: boolean('interested_in_legal_advice')
      .default(false)
      .notNull(),
    interestedInTax: boolean('interested_in_tax').default(false).notNull(),
    interestedInInvestment: boolean('interested_in_investment')
      .default(false)
      .notNull(),
    interestedInPetInsurance: boolean('interested_in_pet_insurance')
      .default(false)
      .notNull(),
    interestedInAccidentInsurance: boolean('interested_in_accident_insurance')
      .default(false)
      .notNull(),
    interestedInTrafficAccident: boolean('interested_in_traffic_accident')
      .default(false)
      .notNull(),
    additionalInterests: text('additional_interests').array(),
    interestNotes: text('interest_notes'),
    lastUpdatedBy: uuid('last_updated_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_interest_categories_client_id_app_client_profiles_id',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.lastUpdatedBy],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_interest_categories_last_updated_by_app_user_profile',
    }),
    unique('app_client_interest_categories_client_id_unique').on(
      table.clientId
    ),
  ]
);

export const appClientMedicalHistory = pgTable(
  'app_client_medical_history',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    hasRecentDiagnosis: boolean('has_recent_diagnosis')
      .default(false)
      .notNull(),
    hasRecentSuspicion: boolean('has_recent_suspicion')
      .default(false)
      .notNull(),
    hasRecentMedication: boolean('has_recent_medication')
      .default(false)
      .notNull(),
    hasRecentTreatment: boolean('has_recent_treatment')
      .default(false)
      .notNull(),
    hasRecentHospitalization: boolean('has_recent_hospitalization')
      .default(false)
      .notNull(),
    hasRecentSurgery: boolean('has_recent_surgery').default(false).notNull(),
    recentMedicalDetails: text('recent_medical_details'),
    hasAdditionalExam: boolean('has_additional_exam').default(false).notNull(),
    additionalExamDetails: text('additional_exam_details'),
    hasMajorHospitalization: boolean('has_major_hospitalization')
      .default(false)
      .notNull(),
    hasMajorSurgery: boolean('has_major_surgery').default(false).notNull(),
    hasLongTermTreatment: boolean('has_long_term_treatment')
      .default(false)
      .notNull(),
    hasLongTermMedication: boolean('has_long_term_medication')
      .default(false)
      .notNull(),
    majorMedicalDetails: text('major_medical_details'),
    privacyLevel: appClientPrivacyLevelEnum('privacy_level')
      .default('confidential')
      .notNull(),
    consentDate: timestamp('consent_date', {
      withTimezone: true,
      mode: 'string',
    }),
    lastUpdatedBy: uuid('last_updated_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [appClientProfiles.id],
      name: 'app_client_medical_history_client_id_app_client_profiles_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.lastUpdatedBy],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_medical_history_last_updated_by_app_user_profiles_id',
    }),
    unique('app_client_medical_history_client_id_unique').on(table.clientId),
  ]
);

export const appInfluencerActivityLogs = pgTable(
  'app_influencer_activity_logs',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    influencerId: uuid('influencer_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    activityType: appInfluencerActivityTypeEnum('activity_type').notNull(),
    title: text().notNull(),
    description: text(),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    impact: text(),
    valueChange: numeric('value_change', { precision: 12, scale: 2 }),
    previousValue: numeric('previous_value', { precision: 12, scale: 2 }),
    newValue: numeric('new_value', { precision: 12, scale: 2 }),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_influencer_activity_logs_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.influencerId],
      foreignColumns: [appInfluencerProfiles.id],
      name: 'app_influencer_activity_logs_influencer_id_app_influencer_profi',
    }).onDelete('cascade'),
  ]
);

export const appNetworkEdges = pgTable(
  'app_network_edges',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    sourceNodeId: uuid('source_node_id').notNull(),
    targetNodeId: uuid('target_node_id').notNull(),
    connectionType: appNetworkConnectionTypeEnum('connection_type').notNull(),
    strength: numeric({ precision: 3, scale: 2 }).default('1.0').notNull(),
    bidirectional: boolean().default(true).notNull(),
    description: text(),
    establishedDate: date('established_date'),
    lastInteraction: timestamp('last_interaction', {
      withTimezone: true,
      mode: 'string',
    }),
    interactionCount: integer('interaction_count').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_network_edges_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.sourceNodeId],
      foreignColumns: [appNetworkNodes.id],
      name: 'app_network_edges_source_node_id_app_network_nodes_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.targetNodeId],
      foreignColumns: [appNetworkNodes.id],
      name: 'app_network_edges_target_node_id_app_network_nodes_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appNetworkOpportunities = pgTable(
  'app_network_opportunities',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    sourceNodeId: uuid('source_node_id').notNull(),
    targetNodeId: uuid('target_node_id'),
    opportunityType: text('opportunity_type').notNull(),
    title: text().notNull(),
    description: text(),
    potentialValue: numeric('potential_value', { precision: 12, scale: 2 }),
    priority: text().default('medium'),
    status: text().default('open'),
    dueDate: date('due_date'),
    completedAt: timestamp('completed_at', {
      withTimezone: true,
      mode: 'string',
    }),
    outcome: text(),
    notes: text(),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_network_opportunities_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.sourceNodeId],
      foreignColumns: [appNetworkNodes.id],
      name: 'app_network_opportunities_source_node_id_app_network_nodes_id_f',
    }),
    foreignKey({
      columns: [table.targetNodeId],
      foreignColumns: [appNetworkNodes.id],
      name: 'app_network_opportunities_target_node_id_app_network_nodes_id_f',
    }),
  ]
);

export const appNetworkInteractions = pgTable(
  'app_network_interactions',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    edgeId: uuid('edge_id').notNull(),
    interactionType: text('interaction_type').notNull(),
    interactionDate: timestamp('interaction_date', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    description: text(),
    outcome: text(),
    strengthChange: numeric('strength_change', {
      precision: 3,
      scale: 2,
    }).default('0'),
    notes: text(),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_network_interactions_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.edgeId],
      foreignColumns: [appNetworkEdges.id],
      name: 'app_network_interactions_edge_id_app_network_edges_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appUserProfiles = pgTable(
  'app_user_profiles',
  {
    id: uuid().primaryKey().notNull(),
    fullName: text('full_name').notNull(),
    phone: text(),
    profileImageUrl: text('profile_image_url'),
    company: text(),
    role: appUserRoleEnum().default('agent').notNull(),
    teamId: uuid('team_id'),
    invitedById: uuid('invited_by_id'),
    invitationsLeft: integer('invitations_left').default(2).notNull(),
    theme: appThemeEnum().default('dark').notNull(),
    googleCalendarToken: jsonb('google_calendar_token'),
    settings: jsonb(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    lastLoginAt: timestamp('last_login_at', {
      withTimezone: true,
      mode: 'string',
    }),
  },
  table => [
    // 🔧 users.id 참조 제거 - Supabase auth.users는 RLS로 관리됨
  ]
);

export const appUserTeams = pgTable(
  'app_user_teams',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    adminId: uuid('admin_id').notNull(),
    settings: jsonb(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.adminId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_user_teams_admin_id_app_user_profiles_id_fk',
    }),
  ]
);

export const publicSiteAnnouncements = pgTable(
  'public_site_announcements',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: text().notNull(),
    content: text().notNull(),
    type: text().default('general').notNull(),
    priority: integer().default(0).notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    isPinned: boolean('is_pinned').default(false).notNull(),
    language: publicLanguageEnum().default('ko').notNull(),
    authorId: uuid('author_id'),
    publishedAt: timestamp('published_at', {
      withTimezone: true,
      mode: 'string',
    }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [appUserProfiles.id],
      name: 'public_site_announcements_author_id_app_user_profiles_id_fk',
    }),
  ]
);

export const publicSiteFaqs = pgTable(
  'public_site_faqs',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    question: text().notNull(),
    answer: text().notNull(),
    category: text().default('general').notNull(),
    order: integer().default(0).notNull(),
    isPublished: boolean('is_published').default(true).notNull(),
    language: publicLanguageEnum().default('ko').notNull(),
    authorId: uuid('author_id'),
    viewCount: integer('view_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [appUserProfiles.id],
      name: 'public_site_faqs_author_id_app_user_profiles_id_fk',
    }),
  ]
);

export const publicSiteAnalytics = pgTable(
  'public_site_analytics',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    path: text().notNull(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    referrer: text(),
    sessionId: text('session_id'),
    userId: uuid('user_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'public_site_analytics_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const publicSiteContents = pgTable(
  'public_site_contents',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    type: publicContentTypeEnum().notNull(),
    title: text().notNull(),
    content: text().notNull(),
    version: text().default('1.0').notNull(),
    language: publicLanguageEnum().default('ko').notNull(),
    status: publicContentStatusEnum().default('draft').notNull(),
    effectiveDate: timestamp('effective_date', {
      withTimezone: true,
      mode: 'string',
    }),
    expiryDate: timestamp('expiry_date', {
      withTimezone: true,
      mode: 'string',
    }),
    authorId: uuid('author_id'),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [appUserProfiles.id],
      name: 'public_site_contents_author_id_app_user_profiles_id_fk',
    }),
  ]
);

export const publicSiteSettings = pgTable(
  'public_site_settings',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    key: text().notNull(),
    value: text().notNull(),
    type: text().default('string').notNull(),
    description: text(),
    isPublic: boolean('is_public').default(false).notNull(),
    updatedBy: uuid('updated_by'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [appUserProfiles.id],
      name: 'public_site_settings_updated_by_app_user_profiles_id_fk',
    }),
    unique('public_site_settings_key_unique').on(table.key),
  ]
);

export const publicSiteTestimonials = pgTable(
  'public_site_testimonials',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    role: text().notNull(),
    company: text().notNull(),
    quote: text().notNull(),
    rating: integer().default(5).notNull(),
    initial: text().notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    order: integer().default(0).notNull(),
    language: publicLanguageEnum().default('ko').notNull(),
    authorId: uuid('author_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [appUserProfiles.id],
      name: 'public_site_testimonials_author_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appCalendarMeetingTemplates = pgTable(
  'app_calendar_meeting_templates',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    name: text().notNull(),
    description: text(),
    defaultDuration: integer('default_duration').default(60).notNull(),
    defaultLocation: text('default_location'),
    checklist: jsonb(),
    isDefault: boolean('is_default').default(false).notNull(),
    googleCalendarTemplateId: text('google_calendar_template_id'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_calendar_meeting_templates_agent_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appCalendarSettings = pgTable(
  'app_calendar_settings',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    defaultView: appCalendarViewEnum('default_view').default('month').notNull(),
    workingHours: jsonb('working_hours'),
    timeZone: text('time_zone').default('Asia/Seoul').notNull(),
    googleCalendarSync: boolean('google_calendar_sync')
      .default(false)
      .notNull(),
    defaultMeetingDuration: integer('default_meeting_duration')
      .default(60)
      .notNull(),
    defaultReminder: appCalendarReminderTypeEnum('default_reminder')
      .default('30_minutes')
      .notNull(),
    googleCalendarId: text('google_calendar_id'),
    googleAccessToken: text('google_access_token'),
    googleRefreshToken: text('google_refresh_token'),
    googleTokenExpiresAt: timestamp('google_token_expires_at', {
      withTimezone: true,
      mode: 'string',
    }),
    lastSyncAt: timestamp('last_sync_at', {
      withTimezone: true,
      mode: 'string',
    }),
    syncStatus: appCalendarSyncStatusEnum('sync_status')
      .default('not_synced')
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_calendar_settings_agent_id_app_user_profiles_id_fk',
    }),
    unique('app_calendar_settings_agent_id_unique').on(table.agentId),
  ]
);

export const appClientTags = pgTable(
  'app_client_tags',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    name: text().notNull(),
    color: text().notNull(),
    description: text(),
    isActive: boolean('is_active').default(true).notNull(),
    privacyLevel: appClientPrivacyLevelEnum('privacy_level')
      .default('public')
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_client_tags_agent_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appDashboardActivityLogs = pgTable(
  'app_dashboard_activity_logs',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    activityType: appDashboardActivityTypeEnum('activity_type').notNull(),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    title: text().notNull(),
    description: text().notNull(),
    impact: text(),
    metadata: jsonb(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_dashboard_activity_logs_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appDashboardGoals = pgTable(
  'app_dashboard_goals',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    teamId: uuid('team_id'),
    title: text().notNull(),
    description: text(),
    goalType: appDashboardGoalTypeEnum('goal_type').notNull(),
    targetValue: numeric('target_value', { precision: 15, scale: 2 }).notNull(),
    currentValue: numeric('current_value', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    period: appDashboardGoalPeriodEnum().notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    isAchieved: boolean('is_achieved').default(false).notNull(),
    achievedAt: timestamp('achieved_at', {
      withTimezone: true,
      mode: 'string',
    }),
    progressPercentage: numeric('progress_percentage', {
      precision: 5,
      scale: 2,
    })
      .default('0')
      .notNull(),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_dashboard_goals_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_dashboard_goals_team_id_app_user_teams_id_fk',
    }),
  ]
);

export const appDashboardNotifications = pgTable(
  'app_dashboard_notifications',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    title: text().notNull(),
    message: text().notNull(),
    type: appDashboardNotificationTypeEnum().notNull(),
    priority: appDashboardNotificationPriorityEnum()
      .default('normal')
      .notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    actionUrl: text('action_url'),
    actionLabel: text('action_label'),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
    readAt: timestamp('read_at', { withTimezone: true, mode: 'string' }),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_dashboard_notifications_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appDashboardPerformanceMetrics = pgTable(
  'app_dashboard_performance_metrics',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    teamId: uuid('team_id'),
    date: date().notNull(),
    period: appDashboardMetricPeriodEnum().notNull(),
    newClients: integer('new_clients').default(0).notNull(),
    totalMeetings: integer('total_meetings').default(0).notNull(),
    completedMeetings: integer('completed_meetings').default(0).notNull(),
    cancelledMeetings: integer('cancelled_meetings').default(0).notNull(),
    newReferrals: integer('new_referrals').default(0).notNull(),
    convertedReferrals: integer('converted_referrals').default(0).notNull(),
    totalRevenue: numeric('total_revenue', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    conversionRate: numeric('conversion_rate', { precision: 5, scale: 2 })
      .default('0')
      .notNull(),
    averageDealSize: numeric('average_deal_size', { precision: 12, scale: 2 })
      .default('0')
      .notNull(),
    pipelineValue: numeric('pipeline_value', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    calculatedAt: timestamp('calculated_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    dataVersion: integer('data_version').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_dashboard_performance_metrics_agent_id_app_user_profiles_id',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_dashboard_performance_metrics_team_id_app_user_teams_id_fk',
    }),
  ]
);

export const appDashboardQuickActions = pgTable(
  'app_dashboard_quick_actions',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    actionType: text('action_type').notNull(),
    title: text().notNull(),
    description: text(),
    icon: text(),
    actionUrl: text('action_url'),
    shortcut: text(),
    isActive: boolean('is_active').default(true).notNull(),
    usageCount: integer('usage_count').default(0).notNull(),
    lastUsed: timestamp('last_used', { withTimezone: true, mode: 'string' }),
    order: integer().default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_dashboard_quick_actions_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appDashboardWidgets = pgTable(
  'app_dashboard_widgets',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    widgetType: appDashboardWidgetTypeEnum('widget_type').notNull(),
    title: text().notNull(),
    position: jsonb().notNull(),
    config: jsonb().notNull(),
    isVisible: boolean('is_visible').default(true).notNull(),
    refreshInterval: integer('refresh_interval').default(300),
    lastRefreshed: timestamp('last_refreshed', {
      withTimezone: true,
      mode: 'string',
    }),
    order: integer().default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_dashboard_widgets_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appInfluencerGratitudeTemplates = pgTable(
  'app_influencer_gratitude_templates',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    name: text().notNull(),
    gratitudeType: appInfluencerGratitudeTypeEnum('gratitude_type').notNull(),
    giftType: appInfluencerGiftTypeEnum('gift_type').default('none').notNull(),
    title: text().notNull(),
    messageTemplate: text('message_template').notNull(),
    placeholders: text().array(),
    isDefault: boolean('is_default').default(false).notNull(),
    usageCount: integer('usage_count').default(0).notNull(),
    lastUsed: timestamp('last_used', { withTimezone: true, mode: 'string' }),
    metadata: jsonb(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_influencer_gratitude_templates_agent_id_app_user_profiles_i',
    }),
  ]
);

export const appInfluencerNetworkAnalysis = pgTable(
  'app_influencer_network_analysis',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    teamId: uuid('team_id'),
    analysisDate: date('analysis_date').notNull(),
    analysisPeriod: text('analysis_period').notNull(),
    totalInfluencers: integer('total_influencers').default(0).notNull(),
    activeInfluencers: integer('active_influencers').default(0).notNull(),
    averageConversionRate: numeric('average_conversion_rate', {
      precision: 5,
      scale: 2,
    })
      .default('0')
      .notNull(),
    totalNetworkValue: numeric('total_network_value', {
      precision: 15,
      scale: 2,
    })
      .default('0')
      .notNull(),
    averageNetworkDepth: numeric('average_network_depth', {
      precision: 5,
      scale: 2,
    })
      .default('0')
      .notNull(),
    averageNetworkWidth: numeric('average_network_width', {
      precision: 5,
      scale: 2,
    })
      .default('0')
      .notNull(),
    topInfluencerIds: text('top_influencer_ids').array(),
    networkGrowthRate: numeric('network_growth_rate', {
      precision: 5,
      scale: 2,
    })
      .default('0')
      .notNull(),
    averageRelationshipStrength: numeric('average_relationship_strength', {
      precision: 3,
      scale: 2,
    })
      .default('0')
      .notNull(),
    totalGratitudesSent: integer('total_gratitudes_sent').default(0).notNull(),
    averageGratitudeFrequency: numeric('average_gratitude_frequency', {
      precision: 5,
      scale: 2,
    })
      .default('0')
      .notNull(),
    calculationVersion: text('calculation_version').default('1.0').notNull(),
    dataQualityScore: numeric('data_quality_score', { precision: 3, scale: 2 })
      .default('0')
      .notNull(),
    missingDataFields: text('missing_data_fields').array(),
    confidenceLevel: numeric('confidence_level', { precision: 3, scale: 2 })
      .default('0')
      .notNull(),
    calculatedAt: timestamp('calculated_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_influencer_network_analysis_agent_id_app_user_profiles_id_f',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_influencer_network_analysis_team_id_app_user_teams_id_fk',
    }),
  ]
);

export const appNetworkStats = pgTable(
  'app_network_stats',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    teamId: uuid('team_id'),
    analysisType: appNetworkAnalysisTypeEnum('analysis_type').notNull(),
    analysisDate: timestamp('analysis_date', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    totalNodes: integer('total_nodes').default(0).notNull(),
    totalConnections: integer('total_connections').default(0).notNull(),
    networkDensity: numeric('network_density', {
      precision: 5,
      scale: 4,
    }).default('0'),
    averagePathLength: numeric('average_path_length', {
      precision: 5,
      scale: 2,
    }).default('0'),
    clusteringCoefficient: numeric('clustering_coefficient', {
      precision: 5,
      scale: 4,
    }).default('0'),
    topInfluencers: jsonb('top_influencers'),
    communityStructure: jsonb('community_structure'),
    growthMetrics: jsonb('growth_metrics'),
    recommendations: jsonb(),
    rawData: jsonb('raw_data'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_network_stats_agent_id_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_network_stats_team_id_app_user_teams_id_fk',
    }),
  ]
);

export const appNotificationHistory = pgTable(
  'app_notification_history',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    queueId: uuid('queue_id'),
    type: appNotificationTypeEnum().notNull(),
    channel: appNotificationChannelEnum().notNull(),
    title: text().notNull(),
    message: text().notNull(),
    recipient: text().notNull(),
    sentAt: timestamp('sent_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    deliveredAt: timestamp('delivered_at', {
      withTimezone: true,
      mode: 'string',
    }),
    readAt: timestamp('read_at', { withTimezone: true, mode: 'string' }),
    status: appNotificationStatusEnum().notNull(),
    responseData: jsonb('response_data'),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.queueId],
      foreignColumns: [appNotificationQueue.id],
      name: 'app_notification_history_queue_id_app_notification_queue_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_notification_history_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appNotificationQueue = pgTable(
  'app_notification_queue',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    templateId: uuid('template_id'),
    type: appNotificationTypeEnum().notNull(),
    channel: appNotificationChannelEnum().notNull(),
    priority: appNotificationPriorityEnum().default('normal').notNull(),
    title: text().notNull(),
    message: text().notNull(),
    recipient: text().notNull(),
    scheduledAt: timestamp('scheduled_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    deliveredAt: timestamp('delivered_at', {
      withTimezone: true,
      mode: 'string',
    }),
    readAt: timestamp('read_at', { withTimezone: true, mode: 'string' }),
    status: appNotificationStatusEnum().default('pending').notNull(),
    retryCount: integer('retry_count').default(0).notNull(),
    maxRetries: integer('max_retries').default(3).notNull(),
    errorMessage: text('error_message'),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [appNotificationTemplates.id],
      name: 'app_notification_queue_template_id_app_notification_templates_i',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_notification_queue_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appNotificationRules = pgTable(
  'app_notification_rules',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    teamId: uuid('team_id'),
    name: text().notNull(),
    description: text(),
    triggerEvent: text('trigger_event').notNull(),
    conditions: jsonb().notNull(),
    actions: jsonb().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    lastTriggered: timestamp('last_triggered', {
      withTimezone: true,
      mode: 'string',
    }),
    triggerCount: integer('trigger_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_notification_rules_team_id_app_user_teams_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_notification_rules_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appNotificationSettings = pgTable(
  'app_notification_settings',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    emailNotifications: boolean('email_notifications').default(true).notNull(),
    smsNotifications: boolean('sms_notifications').default(false).notNull(),
    pushNotifications: boolean('push_notifications').default(true).notNull(),
    kakaoNotifications: boolean('kakao_notifications').default(false).notNull(),
    meetingReminders: boolean('meeting_reminders').default(true).notNull(),
    goalDeadlines: boolean('goal_deadlines').default(true).notNull(),
    newReferrals: boolean('new_referrals').default(true).notNull(),
    clientMilestones: boolean('client_milestones').default(true).notNull(),
    teamUpdates: boolean('team_updates').default(true).notNull(),
    systemAlerts: boolean('system_alerts').default(true).notNull(),
    birthdayReminders: boolean('birthday_reminders').default(true).notNull(),
    followUpReminders: boolean('follow_up_reminders').default(true).notNull(),
    quietHoursStart: text('quiet_hours_start').default('22:00'),
    quietHoursEnd: text('quiet_hours_end').default('08:00'),
    weekendNotifications: boolean('weekend_notifications')
      .default(false)
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_notification_settings_user_id_app_user_profiles_id_fk',
    }),
    unique('app_notification_settings_user_id_unique').on(table.userId),
  ]
);

export const appNotificationSubscriptions = pgTable(
  'app_notification_subscriptions',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    resourceType: text('resource_type').notNull(),
    resourceId: uuid('resource_id').notNull(),
    subscriptionType: text('subscription_type').notNull(),
    channels: appNotificationChannelEnum().array().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_notification_subscriptions_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appNotificationTemplates = pgTable(
  'app_notification_templates',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id'),
    teamId: uuid('team_id'),
    type: appNotificationTypeEnum().notNull(),
    channel: appNotificationChannelEnum().notNull(),
    name: text().notNull(),
    subject: text(),
    bodyTemplate: text('body_template').notNull(),
    variables: jsonb(),
    isDefault: boolean('is_default').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    usageCount: integer('usage_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_notification_templates_team_id_app_user_teams_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_notification_templates_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appReportDashboards = pgTable(
  'app_report_dashboards',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    teamId: uuid('team_id'),
    name: text().notNull(),
    description: text(),
    layout: jsonb().notNull(),
    widgets: jsonb().notNull(),
    filters: jsonb(),
    refreshInterval: integer('refresh_interval').default(300),
    isPublic: boolean('is_public').default(false).notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    lastViewed: timestamp('last_viewed', {
      withTimezone: true,
      mode: 'string',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_report_dashboards_team_id_app_user_teams_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_report_dashboards_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appReportExports = pgTable(
  'app_report_exports',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    reportInstanceId: uuid('report_instance_id'),
    format: appReportFormatEnum().notNull(),
    filePath: text('file_path').notNull(),
    fileSize: integer('file_size').notNull(),
    downloadCount: integer('download_count').default(0).notNull(),
    lastDownloaded: timestamp('last_downloaded', {
      withTimezone: true,
      mode: 'string',
    }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.reportInstanceId],
      foreignColumns: [appReportInstances.id],
      name: 'app_report_exports_report_instance_id_app_report_instances_id_f',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_report_exports_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appReportInstances = pgTable(
  'app_report_instances',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    templateId: uuid('template_id'),
    scheduleId: uuid('schedule_id'),
    name: text().notNull(),
    type: appReportTypeEnum().notNull(),
    format: appReportFormatEnum().notNull(),
    status: appReportStatusEnum().default('pending').notNull(),
    filePath: text('file_path'),
    fileSize: integer('file_size'),
    parameters: jsonb(),
    data: jsonb(),
    metadata: jsonb(),
    generatedAt: timestamp('generated_at', {
      withTimezone: true,
      mode: 'string',
    }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
    downloadCount: integer('download_count').default(0).notNull(),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.scheduleId],
      foreignColumns: [appReportSchedules.id],
      name: 'app_report_instances_schedule_id_app_report_schedules_id_fk',
    }),
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [appReportTemplates.id],
      name: 'app_report_instances_template_id_app_report_templates_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_report_instances_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appReportMetrics = pgTable(
  'app_report_metrics',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    teamId: uuid('team_id'),
    date: date().notNull(),
    metricType: text('metric_type').notNull(),
    value: numeric({ precision: 15, scale: 2 }).notNull(),
    previousValue: numeric('previous_value', { precision: 15, scale: 2 }),
    changePercent: numeric('change_percent', { precision: 5, scale: 2 }),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_report_metrics_team_id_app_user_teams_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_report_metrics_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appReportSchedules = pgTable(
  'app_report_schedules',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    teamId: uuid('team_id'),
    templateId: uuid('template_id').notNull(),
    name: text().notNull(),
    description: text(),
    frequency: appReportFrequencyEnum().notNull(),
    format: appReportFormatEnum().default('pdf').notNull(),
    recipients: text().array().notNull(),
    filters: jsonb(),
    nextRunAt: timestamp('next_run_at', { withTimezone: true, mode: 'string' }),
    lastRunAt: timestamp('last_run_at', { withTimezone: true, mode: 'string' }),
    isActive: boolean('is_active').default(true).notNull(),
    runCount: integer('run_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_report_schedules_team_id_app_user_teams_id_fk',
    }),
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [appReportTemplates.id],
      name: 'app_report_schedules_template_id_app_report_templates_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_report_schedules_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appReportSubscriptions = pgTable(
  'app_report_subscriptions',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    templateId: uuid('template_id').notNull(),
    email: text().notNull(),
    frequency: appReportFrequencyEnum().notNull(),
    format: appReportFormatEnum().default('pdf').notNull(),
    filters: jsonb(),
    isActive: boolean('is_active').default(true).notNull(),
    lastSent: timestamp('last_sent', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [appReportTemplates.id],
      name: 'app_report_subscriptions_template_id_app_report_templates_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_report_subscriptions_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appReportTemplates = pgTable(
  'app_report_templates',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id'),
    teamId: uuid('team_id'),
    name: text().notNull(),
    description: text(),
    type: appReportTypeEnum().notNull(),
    category: text(),
    config: jsonb().notNull(),
    layout: jsonb(),
    filters: jsonb(),
    charts: jsonb(),
    isDefault: boolean('is_default').default(false).notNull(),
    isPublic: boolean('is_public').default(false).notNull(),
    usageCount: integer('usage_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_report_templates_team_id_app_user_teams_id_fk',
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_report_templates_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appSettingsBackups = pgTable(
  'app_settings_backups',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    backupName: text('backup_name').notNull(),
    backupData: jsonb('backup_data').notNull(),
    backupVersion: text('backup_version').default('MVP_v1.0').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_settings_backups_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appSettingsChangeLogs = pgTable(
  'app_settings_change_logs',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    settingCategory: appSettingsCategory('setting_category').notNull(),
    settingField: text('setting_field').notNull(),
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value'),
    changeReason: text('change_reason'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_settings_change_logs_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appSettingsIntegrations = pgTable(
  'app_settings_integrations',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    integrationType: appSettingsIntegrationType('integration_type').notNull(),
    integrationName: text('integration_name').notNull(),
    config: jsonb().notNull(),
    credentials: jsonb(),
    status: appSettingsIntegrationStatus().default('pending').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    lastSyncAt: timestamp('last_sync_at', {
      withTimezone: true,
      mode: 'string',
    }),
    lastErrorMessage: text('last_error_message'),
    syncCount: integer('sync_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_settings_integrations_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appSettingsSecurityLogs = pgTable(
  'app_settings_security_logs',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    actionType: text('action_type').notNull(),
    actionDescription: text('action_description').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    location: text(),
    success: boolean().default(true).notNull(),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_settings_security_logs_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appSettingsThemePreferences = pgTable(
  'app_settings_theme_preferences',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    themeMode: text('theme_mode').default('dark').notNull(),
    sidebarCollapsed: boolean('sidebar_collapsed').default(false).notNull(),
    compactMode: boolean('compact_mode').default(false).notNull(),
    primaryColor: text('primary_color').default('#007bff').notNull(),
    accentColor: text('accent_color').default('#6c757d').notNull(),
    fontSize: text('font_size').default('medium').notNull(),
    fontFamily: text('font_family').default('system').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_settings_theme_preferences_user_id_app_user_profiles_id_fk',
    }),
    unique('app_settings_theme_preferences_user_id_unique').on(table.userId),
  ]
);

export const appSettingsUserProfiles = pgTable(
  'app_settings_user_profiles',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id').notNull(),
    language: text().default('ko').notNull(),
    darkMode: boolean('dark_mode').default(true).notNull(),
    timezone: text().default('Asia/Seoul').notNull(),
    notificationSettings: jsonb('notification_settings')
      .default({
        teamUpdates: true,
        newReferrals: true,
        systemAlerts: true,
        goalDeadlines: true,
        quietHoursEnd: '08:00',
        quietHoursStart: '22:00',
        clientMilestones: true,
        meetingReminders: true,
        smsNotifications: false,
        birthdayReminders: false,
        followUpReminders: true,
        pushNotifications: true,
        emailNotifications: true,
        kakaoNotifications: true,
        weekendNotifications: false,
      })
      .notNull(),
    agentSettings: jsonb('agent_settings').default({
      workingHours: { end: '18:00', start: '09:00', workDays: [1, 2, 3, 4, 5] },
      clientManagement: {
        autoFollowUpDays: 7,
        birthdayReminderDays: 3,
        contractRenewalReminderDays: 30,
      },
      performanceTracking: {
        monthlyGoalReminder: true,
        weeklyReportGeneration: true,
        achievementNotifications: true,
      },
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_settings_user_profiles_user_id_app_user_profiles_id_fk',
    }),
    unique('app_settings_user_profiles_user_id_unique').on(table.userId),
  ]
);

export const appTeamActivityLogs = pgTable(
  'app_team_activity_logs',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    teamId: uuid('team_id').notNull(),
    userId: uuid('user_id'),
    activityType: appTeamActivityTypeEnum('activity_type').notNull(),
    title: text().notNull(),
    description: text(),
    metadata: jsonb().default({}),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_team_activity_logs_team_id_app_user_teams_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_team_activity_logs_user_id_app_user_profiles_id_fk',
    }),
  ]
);

export const appTeamCommunicationChannels = pgTable(
  'app_team_communication_channels',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    teamId: uuid('team_id').notNull(),
    createdBy: uuid('created_by').notNull(),
    channelName: text('channel_name').notNull(),
    channelDescription: text('channel_description'),
    channelType: text('channel_type').default('general').notNull(),
    isPrivate: boolean('is_private').default(false).notNull(),
    isArchived: boolean('is_archived').default(false).notNull(),
    memberCount: integer('member_count').default(0).notNull(),
    messageCount: integer('message_count').default(0).notNull(),
    lastActivityAt: timestamp('last_activity_at', {
      withTimezone: true,
      mode: 'string',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [appUserProfiles.id],
      name: 'app_team_communication_channels_created_by_app_user_profiles_id',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_team_communication_channels_team_id_app_user_teams_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appTeamGoals = pgTable(
  'app_team_goals',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    teamId: uuid('team_id').notNull(),
    createdBy: uuid('created_by').notNull(),
    title: text().notNull(),
    description: text(),
    goalType: text('goal_type').notNull(),
    targetMetric: text('target_metric').notNull(),
    targetValue: numeric('target_value', { precision: 15, scale: 2 }).notNull(),
    currentValue: numeric('current_value', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    startDate: timestamp('start_date', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    endDate: timestamp('end_date', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    isAchieved: boolean('is_achieved').default(false).notNull(),
    achievedAt: timestamp('achieved_at', {
      withTimezone: true,
      mode: 'string',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [appUserProfiles.id],
      name: 'app_team_goals_created_by_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_team_goals_team_id_app_user_teams_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appTeamMembers = pgTable(
  'app_team_members',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    teamId: uuid('team_id').notNull(),
    userId: uuid('user_id').notNull(),
    role: appTeamMemberRoleEnum().default('member').notNull(),
    status: appTeamMemberStatusEnum().default('active').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    invitedBy: uuid('invited_by'),
    lastActiveAt: timestamp('last_active_at', {
      withTimezone: true,
      mode: 'string',
    }),
    notes: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.invitedBy],
      foreignColumns: [appUserProfiles.id],
      name: 'app_team_members_invited_by_app_user_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_team_members_team_id_app_user_teams_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_team_members_user_id_app_user_profiles_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appTeamPerformanceMetrics = pgTable(
  'app_team_performance_metrics',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    teamId: uuid('team_id').notNull(),
    memberId: uuid('member_id').notNull(),
    year: integer().notNull(),
    month: integer().notNull(),
    newClients: integer('new_clients').default(0).notNull(),
    totalContracts: integer('total_contracts').default(0).notNull(),
    totalPremium: numeric('total_premium', { precision: 15, scale: 2 })
      .default('0')
      .notNull(),
    meetingsHeld: integer('meetings_held').default(0).notNull(),
    referralsReceived: integer('referrals_received').default(0).notNull(),
    callsMade: integer('calls_made').default(0).notNull(),
    emailsSent: integer('emails_sent').default(0).notNull(),
    followUpsCompleted: integer('follow_ups_completed').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.memberId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_team_performance_metrics_member_id_app_user_profiles_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_team_performance_metrics_team_id_app_user_teams_id_fk',
    }).onDelete('cascade'),
  ]
);

export const appTeamStatsCache = pgTable(
  'app_team_stats_cache',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    teamId: uuid('team_id').notNull(),
    totalMembers: integer('total_members').default(0).notNull(),
    activeMembers: integer('active_members').default(0).notNull(),
    pendingInvites: integer('pending_invites').default(0).notNull(),
    totalClients: integer('total_clients').default(0).notNull(),
    lastUpdated: timestamp('last_updated', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_team_stats_cache_team_id_app_user_teams_id_fk',
    }).onDelete('cascade'),
    unique('app_team_stats_cache_team_id_unique').on(table.teamId),
  ]
);

export const appTeamTrainingRecords = pgTable(
  'app_team_training_records',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    teamId: uuid('team_id').notNull(),
    memberId: uuid('member_id').notNull(),
    trainerId: uuid('trainer_id'),
    trainingTitle: text('training_title').notNull(),
    trainingType: text('training_type').notNull(),
    trainingDuration: integer('training_duration'),
    isCompleted: boolean('is_completed').default(false).notNull(),
    completedAt: timestamp('completed_at', {
      withTimezone: true,
      mode: 'string',
    }),
    score: integer(),
    certificateNumber: text('certificate_number'),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
    notes: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.memberId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_team_training_records_member_id_app_user_profiles_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [appUserTeams.id],
      name: 'app_team_training_records_team_id_app_user_teams_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.trainerId],
      foreignColumns: [appUserProfiles.id],
      name: 'app_team_training_records_trainer_id_app_user_profiles_id_fk',
    }),
  ]
);

export const adminSystemSettings = pgTable(
  'admin_system_settings',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    key: text().notNull(),
    value: jsonb().notNull(),
    description: text(),
    isActive: boolean('is_active').default(true).notNull(),
    updatedById: uuid('updated_by_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => [unique('admin_system_settings_key_unique').on(table.key)]
);

export const adminSystemStatsCache = pgTable(
  'admin_system_stats_cache',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    statType: text('stat_type').notNull(),
    statData: jsonb('stat_data').notNull(),
    calculatedAt: timestamp('calculated_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
  },
  table => [
    unique('admin_system_stats_cache_stat_type_unique').on(table.statType),
  ]
);
