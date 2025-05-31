// Team 기능에 특화된 스키마 (MVP용)
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
} from '~/lib/schema';

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
import { profiles, teams, invitations, type Team } from '~/lib/schema';

// ===== MVP 팀 관리 Enum (네이밍 컨벤션 적용) =====
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

// ===== MVP 핵심 팀 관리 테이블 (네이밍 컨벤션 적용) =====

// 팀 멤버 테이블 (MVP 핵심)
export const appTeamMembers = pgTable('app_team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  role: appTeamMemberRoleEnum('role').default('member').notNull(),
  status: appTeamMemberStatusEnum('status').default('active').notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  invitedBy: uuid('invited_by').references(() => profiles.id),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  notes: text('notes'), // 멤버에 대한 간단한 메모
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 팀 통계 캐시 테이블 (MVP 성능 최적화)
export const appTeamStatsCache = pgTable('app_team_stats_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .notNull()
    .unique()
    .references(() => teams.id, { onDelete: 'cascade' }),
  totalMembers: integer('total_members').default(0).notNull(),
  activeMembers: integer('active_members').default(0).notNull(),
  pendingInvites: integer('pending_invites').default(0).notNull(),
  totalClients: integer('total_clients').default(0).notNull(),
  lastUpdated: timestamp('last_updated', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ===== Relations (MVP용) =====
export const appTeamMembersRelations = relations(appTeamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [appTeamMembers.teamId],
    references: [teams.id],
  }),
  user: one(profiles, {
    fields: [appTeamMembers.userId],
    references: [profiles.id],
  }),
  invitedByUser: one(profiles, {
    fields: [appTeamMembers.invitedBy],
    references: [profiles.id],
    relationName: 'invited_by',
  }),
}));

export const appTeamStatsCacheRelations = relations(
  appTeamStatsCache,
  ({ one }) => ({
    team: one(teams, {
      fields: [appTeamStatsCache.teamId],
      references: [teams.id],
    }),
  })
);

// ===== MVP 타입 정의 =====
export type AppTeamMember = typeof appTeamMembers.$inferSelect;
export type NewAppTeamMember = typeof appTeamMembers.$inferInsert;
export type AppTeamStatsCache = typeof appTeamStatsCache.$inferSelect;
export type NewAppTeamStatsCache = typeof appTeamStatsCache.$inferInsert;

export type AppTeamMemberRole =
  (typeof appTeamMemberRoleEnum.enumValues)[number];
export type AppTeamMemberStatus =
  (typeof appTeamMemberStatusEnum.enumValues)[number];

// ===== MVP 인터페이스 (실제 사용용) =====
export interface TeamMemberData {
  id: string;
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  role: AppTeamMemberRole;
  status: AppTeamMemberStatus;
  joinedAt: Date;
  lastActiveAt?: Date;
  notes?: string;
  performance?: {
    clients: number;
    conversions: number;
  };
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  totalClients: number;
}
