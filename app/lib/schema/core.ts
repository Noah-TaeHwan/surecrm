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

// Enum 정의 (새로운 네이밍 컨벤션 적용)
export const appUserRoleEnum = pgEnum('app_user_role_enum', [
  'agent',
  'team_admin',
  'system_admin',
]);

export const appImportanceEnum = pgEnum('app_importance_enum', [
  'high',
  'medium',
  'low',
]);

export const appGenderEnum = pgEnum('app_gender_enum', ['male', 'female']);

export const appInsuranceTypeEnum = pgEnum('app_insurance_type_enum', [
  'life',
  'health',
  'auto',
  'prenatal',
  'property',
  'other',
]);

export const appMeetingTypeEnum = pgEnum('app_meeting_type_enum', [
  'first_consultation',
  'product_explanation',
  'contract_review',
  'follow_up',
  'other',
]);

export const appMeetingStatusEnum = pgEnum('app_meeting_status_enum', [
  'scheduled',
  'completed',
  'cancelled',
  'rescheduled',
]);

export const appReferralStatusEnum = pgEnum('app_referral_status_enum', [
  'active',
  'inactive',
]);

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

export const appInvitationStatusEnum = pgEnum('app_invitation_status_enum', [
  'pending',
  'used',
  'expired',
  'cancelled',
]);

export const appThemeEnum = pgEnum('app_theme_enum', ['light', 'dark']);

// 🆕 납입주기 열거형 추가
export const appPaymentCycleEnum = pgEnum('app_payment_cycle_enum', [
  'monthly', // 월납
  'quarterly', // 분기납
  'semi-annual', // 반년납
  'annual', // 연납
  'lump-sum', // 일시납
]);

// ===== 핵심 공유 테이블들 =====

// Profiles 테이블 (auth.users 확장)
export const profiles = pgTable('app_user_profiles', {
  id: uuid('id')
    .primaryKey()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  profileImageUrl: text('profile_image_url'),
  company: text('company'),
  role: appUserRoleEnum('role').default('agent').notNull(),
  teamId: uuid('team_id'),
  invitedById: uuid('invited_by_id'),
  invitationsLeft: integer('invitations_left').default(2).notNull(),
  theme: appThemeEnum('theme').default('dark').notNull(),
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
export const teams = pgTable('app_user_teams', {
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
export const pipelineStages = pgTable('app_pipeline_stages', {
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
export const clients: any = pgTable('app_client_profiles', {
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
  importance: appImportanceEnum('importance').default('medium').notNull(),
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
export const clientDetails = pgTable('app_client_details', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .unique()
    .references(() => clients.id, { onDelete: 'cascade' }),
  ssn: text('ssn'), // 암호화 저장 필요
  birthDate: date('birth_date'),
  gender: appGenderEnum('gender'),
  bankAccount: text('bank_account'), // 암호화 저장 필요
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  medicalHistory: text('medical_history'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Insurance Info 테이블
export const insuranceInfo = pgTable('app_client_insurance', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id),
  insuranceType: appInsuranceTypeEnum('insurance_type').notNull(),
  policyNumber: text('policy_number'),
  insurer: text('insurer'),
  premium: decimal('premium', { precision: 10, scale: 2 }),
  coverageAmount: decimal('coverage_amount', { precision: 12, scale: 2 }),
  startDate: date('start_date'),
  endDate: date('end_date'),
  beneficiary: text('beneficiary'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Referrals 테이블 (소개 관계)
export const referrals = pgTable('app_client_referrals', {
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
  status: appReferralStatusEnum('status').default('active').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Meetings 테이블
export const meetings = pgTable('app_client_meetings', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  title: text('title').notNull(),
  description: text('description'),
  meetingType: appMeetingTypeEnum('meeting_type').notNull(),
  status: appMeetingStatusEnum('status').default('scheduled').notNull(),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  duration: integer('duration').default(60).notNull(), // 분 단위
  location: text('location'),
  googleMeetLink: text('google_meet_link'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Invitations 테이블 - SureCRM 프리미엄 멤버십 추천 코드 시스템
export const invitations = pgTable('app_user_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').unique().notNull(),
  inviterId: uuid('inviter_id')
    .notNull()
    .references(() => profiles.id),
  inviteeEmail: text('invitee_email'),
  message: text('message'),
  status: appInvitationStatusEnum('status').default('pending').notNull(),
  usedById: uuid('used_by_id').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }), // MVP: 영구 유효 코드 (선택적)
  usedAt: timestamp('used_at', { withTimezone: true }),
});

// Documents 테이블
export const documents = pgTable('app_client_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id),
  insuranceInfoId: uuid('insurance_info_id').references(() => insuranceInfo.id),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  documentType: appDocumentTypeEnum('document_type').notNull(),
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

// 🆕 NEW: Opportunity Products 테이블 (영업 기회별 상품 정보)
export const opportunityProducts = pgTable('app_opportunity_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),

  // 상품 정보
  productName: text('product_name').notNull(), // 상품명
  insuranceCompany: text('insurance_company').notNull(), // 보험회사명
  insuranceType: appInsuranceTypeEnum('insurance_type').notNull(), // 보험 타입

  // 금액 정보
  monthlyPremium: decimal('monthly_premium', { precision: 12, scale: 2 }), // 월 납입료(보험료)
  expectedCommission: decimal('expected_commission', {
    precision: 12,
    scale: 2,
  }), // 예상 수수료(매출)

  // 기본 영업 정보
  notes: text('notes'), // 영업 메모
  status: text('status').default('active').notNull(), // active, inactive, completed, cancelled

  // 메타데이터
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
  // 🆕 보험계약 관계
  insuranceContracts: many(insuranceContracts, {
    relationName: 'client_insurance_contracts',
  }),
  opportunityProducts: many(opportunityProducts, {
    relationName: 'client_opportunity_products',
  }),
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

// ===== Admin 백오피스 전용 테이블들 =====

// Admin 감사 로그 테이블 (system_admin 작업 추적)
export const adminAuditLogs = pgTable('admin_system_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id').notNull(), // system_admin 사용자 ID
  action: text('action').notNull(), // 수행한 작업
  tableName: text('table_name'), // 대상 테이블
  targetId: text('target_id'), // 대상 레코드 ID
  oldValues: jsonb('old_values'), // 변경 전 데이터
  newValues: jsonb('new_values'), // 변경 후 데이터
  ipAddress: text('ip_address'), // 접근 IP
  userAgent: text('user_agent'), // 브라우저 정보
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Admin 시스템 설정 테이블 (백오피스 전용 설정)
export const adminSettings = pgTable('admin_system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').unique().notNull(), // 설정 키
  value: jsonb('value').notNull(), // 설정 값
  description: text('description'), // 설정 설명
  isActive: boolean('is_active').default(true).notNull(),
  updatedById: uuid('updated_by_id').notNull(), // 마지막 수정자
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Admin 통계 캐시 테이블 (백오피스 대시보드용)
export const adminStatsCache = pgTable('admin_system_stats_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  statType: text('stat_type').unique().notNull(), // 통계 유형
  statData: jsonb('stat_data').notNull(), // 통계 데이터
  calculatedAt: timestamp('calculated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

// ===== Admin Relations =====

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
  admin: one(profiles, {
    fields: [adminAuditLogs.adminId],
    references: [profiles.id],
    relationName: 'admin_audit_logs',
  }),
}));

export const adminSettingsRelations = relations(adminSettings, ({ one }) => ({
  updatedBy: one(profiles, {
    fields: [adminSettings.updatedById],
    references: [profiles.id],
    relationName: 'admin_settings_updater',
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

// Admin 타입들
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type NewAdminAuditLog = typeof adminAuditLogs.$inferInsert;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type NewAdminSetting = typeof adminSettings.$inferInsert;
export type AdminStatsCache = typeof adminStatsCache.$inferSelect;
export type NewAdminStatsCache = typeof adminStatsCache.$inferInsert;

// Enum 타입들 (새로운 네이밍 반영)
export type UserRole = (typeof appUserRoleEnum.enumValues)[number];
export type Importance = (typeof appImportanceEnum.enumValues)[number];
export type Gender = (typeof appGenderEnum.enumValues)[number];
export type InsuranceType = (typeof appInsuranceTypeEnum.enumValues)[number];
export type MeetingType = (typeof appMeetingTypeEnum.enumValues)[number];
export type MeetingStatus = (typeof appMeetingStatusEnum.enumValues)[number];
export type ReferralStatus = (typeof appReferralStatusEnum.enumValues)[number];
export type DocumentType = (typeof appDocumentTypeEnum.enumValues)[number];
export type InvitationStatus =
  (typeof appInvitationStatusEnum.enumValues)[number];

// Opportunity Products Relations
export const opportunityProductsRelations = relations(
  opportunityProducts,
  ({ one, many }) => ({
    client: one(clients, {
      fields: [opportunityProducts.clientId],
      references: [clients.id],
      relationName: 'client_opportunity_products',
    }),
    agent: one(profiles, {
      fields: [opportunityProducts.agentId],
      references: [profiles.id],
      relationName: 'agent_opportunity_products',
    }),
    contracts: many(insuranceContracts, {
      relationName: 'opportunity_product_contracts',
    }),
  })
);

// Opportunity Products 타입 정의
export type OpportunityProduct = typeof opportunityProducts.$inferSelect;
export type NewOpportunityProduct = typeof opportunityProducts.$inferInsert;

// 🆕 보험계약 관련 타입들
export type InsuranceContract = typeof insuranceContracts.$inferSelect;
export type NewInsuranceContract = typeof insuranceContracts.$inferInsert;
export type ContractAttachment = typeof contractAttachments.$inferSelect;
export type NewContractAttachment = typeof contractAttachments.$inferInsert;
export type ContractStatus = (typeof appContractStatusEnum.enumValues)[number];
export type ContractDocumentType =
  (typeof appContractDocumentTypeEnum.enumValues)[number];
export type PaymentCycle = (typeof appPaymentCycleEnum.enumValues)[number]; // 🆕 납입주기 타입

// ===== 🆕 NEW: 보험계약 관리 테이블들 =====

// 보험계약 상태 열거형
export const appContractStatusEnum = pgEnum('app_contract_status_enum', [
  'draft', // 초안
  'active', // 유효
  'cancelled', // 해지
  'expired', // 만료
  'suspended', // 정지
]);

// 계약 첨부파일 타입 열거형
export const appContractDocumentTypeEnum = pgEnum(
  'app_contract_document_type_enum',
  [
    'contract', // 계약서
    'policy', // 증권
    'application', // 청약서
    'identification', // 신분증
    'medical_report', // 건강검진서
    'vehicle_registration', // 자동차등록증
    'other_document', // 기타 서류
  ]
);

// 보험계약 메인 테이블 (실제 계약 성사된 보험)
export const insuranceContracts = pgTable('app_client_insurance_contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),

  // 연동된 영업 기회 (선택사항)
  opportunityProductId: uuid('opportunity_product_id').references(
    () => opportunityProducts.id
  ),

  // 보험 상품 정보
  productName: text('product_name').notNull(), // 상품명
  insuranceCompany: text('insurance_company').notNull(), // 보험회사명
  insuranceType: appInsuranceTypeEnum('insurance_type').notNull(), // 보험 타입
  insuranceCode: text('insurance_code'), // 🆕 보종코드

  // 계약 정보
  contractNumber: text('contract_number'), // 계약번호
  policyNumber: text('policy_number'), // 증권번호
  contractDate: date('contract_date').notNull(), // 계약일
  effectiveDate: date('effective_date').notNull(), // 보험개시일
  expirationDate: date('expiration_date'), // 만기일
  paymentDueDate: date('payment_due_date'), // 🆕 납기일

  // 계약자/피보험자 정보
  contractorName: text('contractor_name').notNull(), // 계약자명
  contractorSsn: text('contractor_ssn'), // 🆕 계약자 주민번호 (암호화 저장)
  contractorPhone: text('contractor_phone'), // 🆕 계약자 연락처
  insuredName: text('insured_name').notNull(), // 피보험자명
  insuredSsn: text('insured_ssn'), // 🆕 피보험자 주민번호 (암호화 저장)
  insuredPhone: text('insured_phone'), // 🆕 피보험자 연락처
  beneficiaryName: text('beneficiary_name'), // 수익자명

  // 금액 정보
  premiumAmount: decimal('premium_amount', { precision: 12, scale: 2 }), // 🆕 납입보험료 (통합)
  monthlyPremium: decimal('monthly_premium', { precision: 12, scale: 2 }), // 월 보험료
  annualPremium: decimal('annual_premium', { precision: 12, scale: 2 }), // 연 보험료
  coverageAmount: decimal('coverage_amount', { precision: 15, scale: 2 }), // 보장금액
  agentCommission: decimal('agent_commission', { precision: 12, scale: 2 }), // 설계사 수수료

  // 계약 상태 및 관리
  status: appContractStatusEnum('status').default('active').notNull(),
  isRenewalContract: boolean('is_renewal_contract').default(false).notNull(), // 갱신 계약 여부
  parentContractId: uuid('parent_contract_id'), // 원계약 ID (갱신 시)

  // 특약 및 추가 정보
  specialClauses: text('special_clauses'), // 특약사항
  paymentMethod: text('payment_method'), // 납입방법 (월납, 연납 등)
  paymentCycle: appPaymentCycleEnum('payment_cycle'), // 🆕 납입주기 (열거형)
  paymentPeriod: integer('payment_period'), // 납입기간 (년)

  // 메모 및 비고
  notes: text('notes'), // 메모/비고
  internalNotes: text('internal_notes'), // 내부 메모 (고객 비공개)

  // 메타 정보
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 계약 첨부파일 테이블
export const contractAttachments = pgTable('app_client_contract_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  contractId: uuid('contract_id')
    .notNull()
    .references(() => insuranceContracts.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),

  // 파일 정보
  fileName: text('file_name').notNull(), // 원본 파일명
  fileDisplayName: text('file_display_name').notNull(), // 표시용 파일명
  filePath: text('file_path').notNull(), // Supabase Storage 경로
  fileSize: integer('file_size').notNull(), // 파일 크기 (bytes)
  mimeType: text('mime_type').notNull(), // MIME 타입

  // 문서 분류
  documentType: appContractDocumentTypeEnum('document_type').notNull(),
  description: text('description'), // 파일 설명

  // 메타 정보
  uploadedAt: timestamp('uploaded_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// 보험계약 Relations
export const insuranceContractsRelations = relations(
  insuranceContracts,
  ({ one, many }) => ({
    client: one(clients, {
      fields: [insuranceContracts.clientId],
      references: [clients.id],
      relationName: 'client_insurance_contracts',
    }),
    agent: one(profiles, {
      fields: [insuranceContracts.agentId],
      references: [profiles.id],
      relationName: 'agent_insurance_contracts',
    }),
    opportunityProduct: one(opportunityProducts, {
      fields: [insuranceContracts.opportunityProductId],
      references: [opportunityProducts.id],
      relationName: 'opportunity_product_contracts',
    }),
    parentContract: one(insuranceContracts, {
      fields: [insuranceContracts.parentContractId],
      references: [insuranceContracts.id],
      relationName: 'contract_renewals',
    }),
    renewalContracts: many(insuranceContracts, {
      relationName: 'contract_renewals',
    }),
    attachments: many(contractAttachments, {
      relationName: 'contract_attachments',
    }),
  })
);

export const contractAttachmentsRelations = relations(
  contractAttachments,
  ({ one }) => ({
    contract: one(insuranceContracts, {
      fields: [contractAttachments.contractId],
      references: [insuranceContracts.id],
      relationName: 'contract_attachments',
    }),
    agent: one(profiles, {
      fields: [contractAttachments.agentId],
      references: [profiles.id],
      relationName: 'agent_contract_attachments',
    }),
  })
);
