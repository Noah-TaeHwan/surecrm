// Team 기능에 특화된 스키마
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  invitations,
  // 타입들
  type Profile,
  type Team,
  type NewTeam,
  type Invitation,
  type UserRole,
  type InvitationStatus,
} from '~/lib/supabase-schema';

import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
  jsonb,
  decimal,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { profiles, teams, invitations, type Team } from '~/lib/supabase-schema';

// Team 특화 Enum
export const memberRoleEnum = pgEnum('member_role', [
  'member',
  'admin',
  'owner',
  'viewer',
]);

export const memberStatusEnum = pgEnum('member_status', [
  'active',
  'inactive',
  'pending',
  'suspended',
]);

export const teamEventTypeEnum = pgEnum('team_event_type', [
  'member_joined',
  'member_left',
  'member_promoted',
  'member_demoted',
  'settings_changed',
  'goal_created',
  'goal_achieved',
  'milestone_reached',
]);

export const collaborationTypeEnum = pgEnum('collaboration_type', [
  'shared_client',
  'joint_meeting',
  'referral_handoff',
  'knowledge_share',
  'peer_review',
]);

// Team 특화 테이블들

// Team Members 테이블 (팀 멤버 관리)
export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  role: memberRoleEnum('role').default('member').notNull(),
  status: memberStatusEnum('status').default('active').notNull(),
  permissions: text('permissions').array(), // 특별 권한들
  joinedAt: timestamp('joined_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  invitedBy: uuid('invited_by').references(() => profiles.id),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  notes: text('notes'), // 멤버에 대한 메모
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Team Goals 테이블 (팀 목표)
export const teamGoals = pgTable('team_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => profiles.id),
  title: text('title').notNull(),
  description: text('description'),
  targetValue: decimal('target_value', { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 15, scale: 2 })
    .default('0')
    .notNull(),
  unit: text('unit'), // 'clients', 'revenue', 'meetings', 'referrals'
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isAchieved: boolean('is_achieved').default(false).notNull(),
  achievedAt: timestamp('achieved_at', { withTimezone: true }),
  priority: text('priority').default('medium').notNull(), // 'low', 'medium', 'high'
  assignedMembers: text('assigned_members').array(), // 담당 멤버 ID들
  milestones: jsonb('milestones'), // 중간 목표들
  rewards: jsonb('rewards'), // 달성 시 보상
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Team Performance 테이블 (팀 성과)
export const teamPerformance = pgTable('team_performance', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly', 'quarterly'
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  totalClients: integer('total_clients').default(0).notNull(),
  newClients: integer('new_clients').default(0).notNull(),
  totalMeetings: integer('total_meetings').default(0).notNull(),
  completedMeetings: integer('completed_meetings').default(0).notNull(),
  totalReferrals: integer('total_referrals').default(0).notNull(),
  successfulReferrals: integer('successful_referrals').default(0).notNull(),
  totalRevenue: decimal('total_revenue', { precision: 15, scale: 2 })
    .default('0')
    .notNull(),
  averageRevenue: decimal('average_revenue', { precision: 12, scale: 2 })
    .default('0')
    .notNull(),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 })
    .default('0')
    .notNull(),
  memberCount: integer('member_count').default(0).notNull(),
  activeMembers: integer('active_members').default(0).notNull(),
  topPerformerId: uuid('top_performer_id').references(() => profiles.id),
  metrics: jsonb('metrics'), // 추가 성과 지표
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Team Activities 테이블 (팀 활동 로그)
export const teamActivities = pgTable('team_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => profiles.id),
  eventType: teamEventTypeEnum('event_type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  entityType: text('entity_type'), // 'member', 'goal', 'setting', 'client'
  entityId: uuid('entity_id'),
  changes: jsonb('changes'), // 변경 내용
  metadata: jsonb('metadata'),
  isImportant: boolean('is_important').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Team Collaborations 테이블 (팀 협업)
export const teamCollaborations = pgTable('team_collaborations', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  initiatedBy: uuid('initiated_by')
    .notNull()
    .references(() => profiles.id),
  participants: text('participants').array().notNull(), // 참여자 ID들
  type: collaborationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  relatedEntityType: text('related_entity_type'), // 'client', 'meeting', 'referral'
  relatedEntityId: uuid('related_entity_id'),
  status: text('status').default('active').notNull(), // 'active', 'completed', 'cancelled'
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  outcomes: jsonb('outcomes'), // 협업 결과
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Team Knowledge Base 테이블 (팀 지식 베이스)
export const teamKnowledgeBase = pgTable('team_knowledge_base', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => profiles.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category'), // 'best_practices', 'templates', 'procedures', 'faq'
  tags: text('tags').array(),
  isPublic: boolean('is_public').default(false).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  likeCount: integer('like_count').default(0).notNull(),
  lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }),
  attachments: jsonb('attachments'), // 첨부 파일 정보
  relatedArticles: text('related_articles').array(), // 관련 문서 ID들
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Team Announcements 테이블 (팀 공지사항)
export const teamAnnouncements = pgTable('team_announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => profiles.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  priority: text('priority').default('normal').notNull(), // 'low', 'normal', 'high', 'urgent'
  isUrgent: boolean('is_urgent').default(false).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  targetMembers: text('target_members').array(), // 특정 멤버 대상 (null이면 전체)
  readBy: text('read_by').array().default([]), // 읽은 멤버 ID들
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  attachments: jsonb('attachments'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Team Templates 테이블 (팀 템플릿)
export const teamTemplates = pgTable('team_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => profiles.id),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'meeting', 'email', 'proposal', 'report'
  category: text('category'),
  template: jsonb('template').notNull(), // 템플릿 내용
  variables: jsonb('variables'), // 사용 가능한 변수들
  isDefault: boolean('is_default').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  lastUsed: timestamp('last_used', { withTimezone: true }),
  tags: text('tags').array(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations 정의
export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(profiles, {
    fields: [teamMembers.userId],
    references: [profiles.id],
  }),
  invitedByUser: one(profiles, {
    fields: [teamMembers.invitedBy],
    references: [profiles.id],
    relationName: 'invited_by',
  }),
}));

export const teamGoalsRelations = relations(teamGoals, ({ one }) => ({
  team: one(teams, {
    fields: [teamGoals.teamId],
    references: [teams.id],
  }),
  creator: one(profiles, {
    fields: [teamGoals.createdBy],
    references: [profiles.id],
  }),
}));

export const teamPerformanceRelations = relations(
  teamPerformance,
  ({ one }) => ({
    team: one(teams, {
      fields: [teamPerformance.teamId],
      references: [teams.id],
    }),
    topPerformer: one(profiles, {
      fields: [teamPerformance.topPerformerId],
      references: [profiles.id],
    }),
  })
);

export const teamActivitiesRelations = relations(teamActivities, ({ one }) => ({
  team: one(teams, {
    fields: [teamActivities.teamId],
    references: [teams.id],
  }),
  user: one(profiles, {
    fields: [teamActivities.userId],
    references: [profiles.id],
  }),
}));

export const teamCollaborationsRelations = relations(
  teamCollaborations,
  ({ one }) => ({
    team: one(teams, {
      fields: [teamCollaborations.teamId],
      references: [teams.id],
    }),
    initiator: one(profiles, {
      fields: [teamCollaborations.initiatedBy],
      references: [profiles.id],
    }),
  })
);

export const teamKnowledgeBaseRelations = relations(
  teamKnowledgeBase,
  ({ one }) => ({
    team: one(teams, {
      fields: [teamKnowledgeBase.teamId],
      references: [teams.id],
    }),
    author: one(profiles, {
      fields: [teamKnowledgeBase.authorId],
      references: [profiles.id],
    }),
  })
);

export const teamAnnouncementsRelations = relations(
  teamAnnouncements,
  ({ one }) => ({
    team: one(teams, {
      fields: [teamAnnouncements.teamId],
      references: [teams.id],
    }),
    author: one(profiles, {
      fields: [teamAnnouncements.authorId],
      references: [profiles.id],
    }),
  })
);

export const teamTemplatesRelations = relations(teamTemplates, ({ one }) => ({
  team: one(teams, {
    fields: [teamTemplates.teamId],
    references: [teams.id],
  }),
  creator: one(profiles, {
    fields: [teamTemplates.createdBy],
    references: [profiles.id],
  }),
}));

// Team 특화 타입들
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type TeamGoal = typeof teamGoals.$inferSelect;
export type NewTeamGoal = typeof teamGoals.$inferInsert;
export type TeamPerformance = typeof teamPerformance.$inferSelect;
export type NewTeamPerformance = typeof teamPerformance.$inferInsert;
export type TeamActivity = typeof teamActivities.$inferSelect;
export type NewTeamActivity = typeof teamActivities.$inferInsert;
export type TeamCollaboration = typeof teamCollaborations.$inferSelect;
export type NewTeamCollaboration = typeof teamCollaborations.$inferInsert;
export type TeamKnowledgeBase = typeof teamKnowledgeBase.$inferSelect;
export type NewTeamKnowledgeBase = typeof teamKnowledgeBase.$inferInsert;
export type TeamAnnouncement = typeof teamAnnouncements.$inferSelect;
export type NewTeamAnnouncement = typeof teamAnnouncements.$inferInsert;
export type TeamTemplate = typeof teamTemplates.$inferSelect;
export type NewTeamTemplate = typeof teamTemplates.$inferInsert;

export type MemberRole = (typeof memberRoleEnum.enumValues)[number];
export type MemberStatus = (typeof memberStatusEnum.enumValues)[number];
export type TeamEventType = (typeof teamEventTypeEnum.enumValues)[number];
export type CollaborationType =
  (typeof collaborationTypeEnum.enumValues)[number];

// Team 특화 인터페이스
export interface TeamOverview {
  team: Team;
  memberCount: number;
  activeGoals: number;
  completedGoals: number;
  currentPerformance: {
    totalClients: number;
    newClients: number;
    totalRevenue: number;
    conversionRate: number;
  };
  topPerformers: {
    id: string;
    name: string;
    avatar?: string;
    clients: number;
    revenue: number;
  }[];
  recentActivities: TeamActivity[];
}

export interface TeamMemberData {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
  };
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date;
  lastActiveAt?: Date;
  permissions: string[];
  performance?: {
    clients: number;
    meetings: number;
    revenue: number;
    conversionRate: number;
  };
}

export interface TeamGoalData {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  progress: number; // 0-100
  startDate: Date;
  endDate: Date;
  daysLeft: number;
  isAchieved: boolean;
  priority: 'low' | 'medium' | 'high';
  assignedMembers: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  milestones?: {
    value: number;
    label: string;
    isCompleted: boolean;
  }[];
}

export interface TeamPerformanceData {
  period: string;
  startDate: Date;
  endDate: Date;
  metrics: {
    totalClients: number;
    newClients: number;
    totalMeetings: number;
    completedMeetings: number;
    totalReferrals: number;
    successfulReferrals: number;
    totalRevenue: number;
    conversionRate: number;
  };
  memberPerformance: {
    memberId: string;
    memberName: string;
    clients: number;
    meetings: number;
    revenue: number;
    rank: number;
  }[];
  trends: {
    date: string;
    clients: number;
    revenue: number;
    meetings: number;
  }[];
}

export interface CollaborationData {
  id: string;
  type: CollaborationType;
  title: string;
  description?: string;
  initiator: {
    id: string;
    name: string;
    avatar?: string;
  };
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  }[];
  status: 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  relatedEntity?: {
    type: string;
    id: string;
    name: string;
  };
  outcomes?: Record<string, any>;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  isPublic: boolean;
  isPinned: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

export interface TeamAnnouncementData {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isUrgent: boolean;
  isPinned: boolean;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  targetMembers?: string[];
  readBy: string[];
  readCount: number;
  totalMembers: number;
  expiresAt?: Date;
  createdAt: Date;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

export interface TeamTemplateData {
  id: string;
  name: string;
  description?: string;
  type: string;
  category?: string;
  template: Record<string, any>;
  variables?: {
    name: string;
    type: string;
    description?: string;
    defaultValue?: any;
  }[];
  isDefault: boolean;
  usageCount: number;
  lastUsed?: Date;
  tags: string[];
  creator: {
    id: string;
    name: string;
  };
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  totalGoals: number;
  activeGoals: number;
  achievedGoals: number;
  totalCollaborations: number;
  activeCollaborations: number;
  knowledgeBaseArticles: number;
  announcements: number;
  templates: number;
}

export interface TeamSettings {
  general: {
    allowMemberInvites: boolean;
    requireApprovalForJoin: boolean;
    defaultMemberRole: MemberRole;
    maxMembers?: number;
  };
  collaboration: {
    enableClientSharing: boolean;
    enableMeetingSharing: boolean;
    enableReferralHandoff: boolean;
    requireApprovalForSharing: boolean;
  };
  notifications: {
    memberJoined: boolean;
    goalAchieved: boolean;
    newAnnouncement: boolean;
    collaborationInvite: boolean;
  };
  privacy: {
    hidePerformanceFromMembers: boolean;
    allowExternalSharing: boolean;
    dataRetentionDays: number;
  };
}
