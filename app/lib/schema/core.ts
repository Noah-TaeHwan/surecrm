import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
  date,
  jsonb,
  decimal,
  pgSchema,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// Auth 스키마 (Supabase가 관리하는 부분 - 참조용)
export const authSchema = pgSchema('auth');

// auth.users 테이블 (Supabase가 관리 - 참조만 가능)
export const authUsers = authSchema.table('users', {
  id: uuid('id').primaryKey(),
  email: text('email'),
  phone: text('phone'),
  emailConfirmedAt: timestamp('email_confirmed_at', { withTimezone: true }),
  phoneConfirmedAt: timestamp('phone_confirmed_at', { withTimezone: true }),
  lastSignInAt: timestamp('last_sign_in_at', { withTimezone: true }),
  rawAppMetaData: jsonb('raw_app_meta_data'),
  rawUserMetaData: jsonb('raw_user_meta_data'),
  createdAt: timestamp('created_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  isAnonymous: boolean('is_anonymous'),
});

// Enum 정의
export const userRoleEnum = pgEnum('user_role', [
  'agent',
  'team_admin',
  'system_admin',
]);

export const importanceEnum = pgEnum('importance', ['high', 'medium', 'low']);

export const genderEnum = pgEnum('gender', ['male', 'female']);

export const insuranceTypeEnum = pgEnum('insurance_type', [
  'life',
  'health',
  'auto',
  'prenatal',
  'property',
  'other',
]);

export const meetingTypeEnum = pgEnum('meeting_type', [
  'first_consultation',
  'product_explanation',
  'contract_review',
  'follow_up',
  'other',
]);

export const meetingStatusEnum = pgEnum('meeting_status', [
  'scheduled',
  'completed',
  'cancelled',
  'rescheduled',
]);

export const referralStatusEnum = pgEnum('referral_status', [
  'active',
  'inactive',
]);

export const documentTypeEnum = pgEnum('document_type', [
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

export const invitationStatusEnum = pgEnum('invitation_status', [
  'pending',
  'used',
  'expired',
  'cancelled',
]);

export const themeEnum = pgEnum('theme', ['light', 'dark']);

// ===== 핵심 공유 테이블들 =====

// Profiles 테이블 (auth.users 확장)
export const profiles = pgTable('profiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  profileImageUrl: text('profile_image_url'),
  company: text('company'),
  role: userRoleEnum('role').default('agent').notNull(),
  teamId: uuid('team_id'),
  invitedById: uuid('invited_by_id'),
  invitationsLeft: integer('invitations_left').default(2).notNull(),
  theme: themeEnum('theme').default('dark').notNull(),
  googleCalendarToken: jsonb('google_calendar_token'),
  settings: jsonb('settings'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
});

// Teams 테이블
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  adminId: uuid('admin_id')
    .notNull()
    .references(() => profiles.id),
  settings: jsonb('settings'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Pipeline Stages 테이블
export const pipelineStages = pgTable('pipeline_stages', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  name: text('name').notNull(),
  order: integer('order').notNull(),
  color: text('color').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Clients 테이블
export const clients: any = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  teamId: uuid('team_id').references(() => teams.id),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone').notNull(),
  telecomProvider: text('telecom_provider'),
  address: text('address'),
  occupation: text('occupation'),
  hasDrivingLicense: boolean('has_driving_license'),
  height: integer('height'), // cm
  weight: integer('weight'), // kg
  tags: text('tags').array(),
  importance: importanceEnum('importance').default('medium').notNull(),
  currentStageId: uuid('current_stage_id')
    .notNull()
    .references(() => pipelineStages.id),
  referredById: uuid('referred_by_id').references((): any => clients.id),
  notes: text('notes'),
  customFields: jsonb('custom_fields'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Client Details 테이블 (민감 정보 분리)
export const clientDetails = pgTable('client_details', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .unique()
    .references(() => clients.id, { onDelete: 'cascade' }),
  ssn: text('ssn'), // 암호화 저장 필요
  birthDate: date('birth_date'),
  gender: genderEnum('gender'),
  consentDate: timestamp('consent_date', { withTimezone: true }),
  consentDetails: jsonb('consent_details'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Insurance Info 테이블
export const insuranceInfo = pgTable('insurance_info', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id),
  insuranceType: insuranceTypeEnum('insurance_type').notNull(),
  details: jsonb('details').notNull(), // 보험 유형별 세부 정보
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Referrals 테이블
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerId: uuid('referrer_id')
    .notNull()
    .references(() => clients.id),
  referredId: uuid('referred_id')
    .notNull()
    .references(() => clients.id),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  referralDate: date('referral_date').defaultNow().notNull(),
  notes: text('notes'),
  status: referralStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Meetings 테이블
export const meetings = pgTable('meetings', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  location: text('location'),
  meetingType: meetingTypeEnum('meeting_type').notNull(),
  status: meetingStatusEnum('status').default('scheduled').notNull(),
  googleEventId: text('google_event_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Invitations 테이블
export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').unique().notNull(),
  inviterId: uuid('inviter_id')
    .notNull()
    .references(() => profiles.id),
  inviteeEmail: text('invitee_email'),
  message: text('message'),
  status: invitationStatusEnum('status').default('pending').notNull(),
  usedById: uuid('used_by_id').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
});

// Documents 테이블
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id),
  insuranceInfoId: uuid('insurance_info_id').references(() => insuranceInfo.id),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  documentType: documentTypeEnum('document_type').notNull(),
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(), // Supabase Storage 경로
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(), // 바이트
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===== Relations 정의 =====

export const profilesRelations = relations(profiles, ({ many, one }) => ({
  clients: many(clients, { relationName: 'agent_clients' }),
  meetings: many(meetings, { relationName: 'agent_meetings' }),
  referrals: many(referrals, { relationName: 'agent_referrals' }),
  documents: many(documents, { relationName: 'agent_documents' }),
  invitedBy: one(profiles, {
    fields: [profiles.invitedById],
    references: [profiles.id],
    relationName: 'user_invitations',
  }),
  invitees: many(profiles, { relationName: 'user_invitations' }),
  team: one(teams, {
    fields: [profiles.teamId],
    references: [teams.id],
    relationName: 'team_members',
  }),
  sentInvitations: many(invitations, { relationName: 'inviter_invitations' }),
  usedInvitations: many(invitations, { relationName: 'used_invitations' }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  admin: one(profiles, {
    fields: [teams.adminId],
    references: [profiles.id],
    relationName: 'team_admin',
  }),
  members: many(profiles, { relationName: 'team_members' }),
  clients: many(clients, { relationName: 'team_clients' }),
  pipelineStages: many(pipelineStages, {
    relationName: 'team_pipeline_stages',
  }),
}));

export const pipelineStagesRelations = relations(
  pipelineStages,
  ({ one, many }) => ({
    agent: one(profiles, {
      fields: [pipelineStages.agentId],
      references: [profiles.id],
      relationName: 'agent_pipeline_stages',
    }),
    team: one(teams, {
      fields: [pipelineStages.teamId],
      references: [teams.id],
      relationName: 'team_pipeline_stages',
    }),
    clients: many(clients, { relationName: 'stage_clients' }),
  })
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  agent: one(profiles, {
    fields: [clients.agentId],
    references: [profiles.id],
    relationName: 'agent_clients',
  }),
  team: one(teams, {
    fields: [clients.teamId],
    references: [teams.id],
    relationName: 'team_clients',
  }),
  currentStage: one(pipelineStages, {
    fields: [clients.currentStageId],
    references: [pipelineStages.id],
    relationName: 'stage_clients',
  }),
  referredBy: one(clients, {
    fields: [clients.referredById],
    references: [clients.id],
    relationName: 'client_referrals',
  }),
  referrals: many(clients, { relationName: 'client_referrals' }),
  clientDetail: one(clientDetails, {
    fields: [clients.id],
    references: [clientDetails.clientId],
    relationName: 'client_detail',
  }),
  insuranceInfo: many(insuranceInfo, { relationName: 'client_insurance' }),
  documents: many(documents, { relationName: 'client_documents' }),
  meetings: many(meetings, { relationName: 'client_meetings' }),
  referralsAsReferrer: many(referrals, { relationName: 'referrer_referrals' }),
  referralsAsReferred: many(referrals, { relationName: 'referred_referrals' }),
}));

export const clientDetailsRelations = relations(clientDetails, ({ one }) => ({
  client: one(clients, {
    fields: [clientDetails.clientId],
    references: [clients.id],
    relationName: 'client_detail',
  }),
}));

export const insuranceInfoRelations = relations(
  insuranceInfo,
  ({ one, many }) => ({
    client: one(clients, {
      fields: [insuranceInfo.clientId],
      references: [clients.id],
      relationName: 'client_insurance',
    }),
    documents: many(documents, { relationName: 'insurance_documents' }),
  })
);

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(clients, {
    fields: [referrals.referrerId],
    references: [clients.id],
    relationName: 'referrer_referrals',
  }),
  referred: one(clients, {
    fields: [referrals.referredId],
    references: [clients.id],
    relationName: 'referred_referrals',
  }),
  agent: one(profiles, {
    fields: [referrals.agentId],
    references: [profiles.id],
    relationName: 'agent_referrals',
  }),
}));

export const meetingsRelations = relations(meetings, ({ one }) => ({
  client: one(clients, {
    fields: [meetings.clientId],
    references: [clients.id],
    relationName: 'client_meetings',
  }),
  agent: one(profiles, {
    fields: [meetings.agentId],
    references: [profiles.id],
    relationName: 'agent_meetings',
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  inviter: one(profiles, {
    fields: [invitations.inviterId],
    references: [profiles.id],
    relationName: 'inviter_invitations',
  }),
  usedBy: one(profiles, {
    fields: [invitations.usedById],
    references: [profiles.id],
    relationName: 'used_invitations',
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  client: one(clients, {
    fields: [documents.clientId],
    references: [clients.id],
    relationName: 'client_documents',
  }),
  insuranceInfo: one(insuranceInfo, {
    fields: [documents.insuranceInfoId],
    references: [insuranceInfo.id],
    relationName: 'insurance_documents',
  }),
  agent: one(profiles, {
    fields: [documents.agentId],
    references: [profiles.id],
    relationName: 'agent_documents',
  }),
}));

// ===== 타입 추론 =====

export type AuthUser = typeof authUsers.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type PipelineStage = typeof pipelineStages.$inferSelect;
export type NewPipelineStage = typeof pipelineStages.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ClientDetail = typeof clientDetails.$inferSelect;
export type NewClientDetail = typeof clientDetails.$inferInsert;
export type InsuranceInfo = typeof insuranceInfo.$inferSelect;
export type NewInsuranceInfo = typeof insuranceInfo.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

// Enum 타입들
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type Importance = (typeof importanceEnum.enumValues)[number];
export type Gender = (typeof genderEnum.enumValues)[number];
export type InsuranceType = (typeof insuranceTypeEnum.enumValues)[number];
export type MeetingType = (typeof meetingTypeEnum.enumValues)[number];
export type MeetingStatus = (typeof meetingStatusEnum.enumValues)[number];
export type ReferralStatus = (typeof referralStatusEnum.enumValues)[number];
export type DocumentType = (typeof documentTypeEnum.enumValues)[number];
export type InvitationStatus = (typeof invitationStatusEnum.enumValues)[number];
