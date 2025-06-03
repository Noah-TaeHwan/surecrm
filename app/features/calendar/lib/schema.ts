// 📅 Calendar 기능 전용 스키마
// Prefix 네이밍 컨벤션: app_calendar_ 사용 (완전 통일)
// 공통 스키마에서 기본 테이블들을 import
export {
  profiles,
  teams,
  clients,
  meetings,
  // 타입들
  type Profile,
  type Team,
  type Client,
  type Meeting,
  type NewMeeting,
  type MeetingType,
  type MeetingStatus,
  type UserRole,
} from '~/lib/schema/core';

import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
  jsonb,
  foreignKey,
  unique,
  date,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { profiles, clients, meetings, teams } from '~/lib/schema/core';

// 📊 Calendar 특화 Enum (완전한 app_calendar_ prefix 통일)
export const appCalendarViewEnum = pgEnum('app_calendar_view_enum', [
  'month',
  'week',
  'day',
  'agenda',
]);

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

export const appCalendarReminderTypeEnum = pgEnum(
  'app_calendar_reminder_type_enum',
  ['none', '5_minutes', '15_minutes', '30_minutes', '1_hour', '1_day']
);

export const appCalendarRecurrenceTypeEnum = pgEnum(
  'app_calendar_recurrence_type_enum',
  ['none', 'daily', 'weekly', 'monthly', 'yearly']
);

// 🌐 Google Calendar 동기화 관련 Enum 추가
export const appCalendarSyncStatusEnum = pgEnum(
  'app_calendar_sync_status_enum',
  ['not_synced', 'syncing', 'synced', 'sync_failed', 'sync_conflict']
);

export const appCalendarExternalSourceEnum = pgEnum(
  'app_calendar_external_source_enum',
  ['local', 'google_calendar', 'outlook', 'apple_calendar']
);

// 🏷️ Calendar 특화 테이블들 (완전한 app_calendar_ prefix 통일)

// Calendar Meeting Templates (미팅 템플릿)
export const appCalendarMeetingTemplates = pgTable(
  'app_calendar_meeting_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => profiles.id),
    name: text('name').notNull(),
    description: text('description'),
    defaultDuration: integer('default_duration').default(60).notNull(), // 분
    defaultLocation: text('default_location'),
    checklist: jsonb('checklist'), // 미팅 체크리스트
    isDefault: boolean('is_default').default(false).notNull(),
    // 🌐 Google Calendar 연동 필드 추가
    googleCalendarTemplateId: text('google_calendar_template_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Calendar Meeting Checklists (미팅별 체크리스트) - prefix 통일
export const appCalendarMeetingChecklists = pgTable(
  'app_calendar_meeting_checklists',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    meetingId: uuid('meeting_id')
      .notNull()
      .references(() => meetings.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    completed: boolean('completed').default(false).notNull(),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Calendar Meeting Reminders (미팅 알림) - prefix 통일
export const appCalendarMeetingReminders = pgTable(
  'app_calendar_meeting_reminders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    meetingId: uuid('meeting_id')
      .notNull()
      .references(() => meetings.id, { onDelete: 'cascade' }),
    reminderType: appCalendarReminderTypeEnum('reminder_type').notNull(),
    reminderTime: timestamp('reminder_time', { withTimezone: true }).notNull(),
    isSent: boolean('is_sent').default(false).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    // 🌐 Google Calendar 연동 필드 추가
    googleCalendarReminderId: text('google_calendar_reminder_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Calendar Meeting Attendees (미팅 참석자) - prefix 통일
export const appCalendarMeetingAttendees = pgTable(
  'app_calendar_meeting_attendees',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    meetingId: uuid('meeting_id')
      .notNull()
      .references(() => meetings.id, { onDelete: 'cascade' }),
    clientId: uuid('client_id').references(() => clients.id),
    agentId: uuid('agent_id').references(() => profiles.id),
    externalEmail: text('external_email'), // 외부 참석자
    externalName: text('external_name'),
    status: text('status').default('pending').notNull(), // pending, accepted, declined
    responseAt: timestamp('response_at', { withTimezone: true }),
    // 🌐 Google Calendar 연동 필드 추가
    googleCalendarAttendeeId: text('google_calendar_attendee_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Calendar Meeting Notes (미팅 노트) - prefix 통일
export const appCalendarMeetingNotes = pgTable('app_calendar_meeting_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  meetingId: uuid('meeting_id')
    .notNull()
    .references(() => meetings.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  content: text('content').notNull(),
  isPrivate: boolean('is_private').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Calendar Settings (캘린더 설정) - prefix 통일
export const appCalendarSettings = pgTable('app_calendar_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .unique()
    .references(() => profiles.id),
  defaultView: appCalendarViewEnum('default_view').default('month').notNull(),
  workingHours: jsonb('working_hours'), // { start: "09:00", end: "18:00", days: [1,2,3,4,5] }
  timeZone: text('time_zone').default('Asia/Seoul').notNull(),
  googleCalendarSync: boolean('google_calendar_sync').default(false).notNull(),
  defaultMeetingDuration: integer('default_meeting_duration')
    .default(60)
    .notNull(),
  defaultReminder: appCalendarReminderTypeEnum('default_reminder')
    .default('30_minutes')
    .notNull(),
  // 🌐 Google Calendar 연동 필드 추가
  googleCalendarId: text('google_calendar_id'), // 주 캘린더 ID
  googleAccessToken: text('google_access_token'), // 암호화된 토큰
  googleRefreshToken: text('google_refresh_token'), // 암호화된 리프레시 토큰
  googleTokenExpiresAt: timestamp('google_token_expires_at', {
    withTimezone: true,
  }),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  syncStatus: appCalendarSyncStatusEnum('sync_status')
    .default('not_synced')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Calendar Recurring Meetings (반복 미팅) - prefix 통일
export const appCalendarRecurringMeetings = pgTable(
  'app_calendar_recurring_meetings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parentMeetingId: uuid('parent_meeting_id')
      .notNull()
      .references(() => meetings.id),
    recurrenceType: appCalendarRecurrenceTypeEnum('recurrence_type').notNull(),
    recurrenceInterval: integer('recurrence_interval').default(1).notNull(), // 매 N일/주/월
    recurrenceEnd: timestamp('recurrence_end', { withTimezone: true }),
    maxOccurrences: integer('max_occurrences'),
    exceptions: jsonb('exceptions'), // 예외 날짜들
    // 🌐 Google Calendar 연동 필드 추가
    googleCalendarRecurrenceId: text('google_calendar_recurrence_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// 🌐 NEW: Google Calendar 동기화 로그 테이블 추가
export const appCalendarSyncLogs = pgTable('app_calendar_sync_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .references(() => profiles.id),
  meetingId: uuid('meeting_id').references(() => meetings.id, {
    onDelete: 'cascade',
  }),
  syncDirection: text('sync_direction').notNull(), // 'to_google', 'from_google', 'bidirectional'
  syncStatus: appCalendarSyncStatusEnum('sync_status').notNull(),
  externalSource: appCalendarExternalSourceEnum('external_source').notNull(),
  externalEventId: text('external_event_id'), // Google Calendar Event ID
  syncResult: jsonb('sync_result'), // 상세 결과 정보
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 🔗 Relations (관계 정의) - 새로운 테이블명 반영
export const appCalendarMeetingTemplatesRelations = relations(
  appCalendarMeetingTemplates,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [appCalendarMeetingTemplates.agentId],
      references: [profiles.id],
    }),
  })
);

export const appCalendarMeetingChecklistsRelations = relations(
  appCalendarMeetingChecklists,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [appCalendarMeetingChecklists.meetingId],
      references: [meetings.id],
    }),
  })
);

export const appCalendarMeetingRemindersRelations = relations(
  appCalendarMeetingReminders,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [appCalendarMeetingReminders.meetingId],
      references: [meetings.id],
    }),
  })
);

export const appCalendarMeetingAttendeesRelations = relations(
  appCalendarMeetingAttendees,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [appCalendarMeetingAttendees.meetingId],
      references: [meetings.id],
    }),
    client: one(clients, {
      fields: [appCalendarMeetingAttendees.clientId],
      references: [clients.id],
    }),
    agent: one(profiles, {
      fields: [appCalendarMeetingAttendees.agentId],
      references: [profiles.id],
    }),
  })
);

export const appCalendarMeetingNotesRelations = relations(
  appCalendarMeetingNotes,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [appCalendarMeetingNotes.meetingId],
      references: [meetings.id],
    }),
    agent: one(profiles, {
      fields: [appCalendarMeetingNotes.agentId],
      references: [profiles.id],
    }),
  })
);

export const appCalendarSettingsRelations = relations(
  appCalendarSettings,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [appCalendarSettings.agentId],
      references: [profiles.id],
    }),
  })
);

export const appCalendarRecurringMeetingsRelations = relations(
  appCalendarRecurringMeetings,
  ({ one }) => ({
    parentMeeting: one(meetings, {
      fields: [appCalendarRecurringMeetings.parentMeetingId],
      references: [meetings.id],
    }),
  })
);

export const appCalendarSyncLogsRelations = relations(
  appCalendarSyncLogs,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [appCalendarSyncLogs.agentId],
      references: [profiles.id],
    }),
    meeting: one(meetings, {
      fields: [appCalendarSyncLogs.meetingId],
      references: [meetings.id],
    }),
  })
);

// 📝 Calendar 특화 타입들 (새로운 테이블명 반영)
export type AppCalendarMeetingTemplate =
  typeof appCalendarMeetingTemplates.$inferSelect;
export type NewAppCalendarMeetingTemplate =
  typeof appCalendarMeetingTemplates.$inferInsert;
export type AppCalendarMeetingChecklist =
  typeof appCalendarMeetingChecklists.$inferSelect;
export type NewAppCalendarMeetingChecklist =
  typeof appCalendarMeetingChecklists.$inferInsert;
export type AppCalendarMeetingReminder =
  typeof appCalendarMeetingReminders.$inferSelect;
export type NewAppCalendarMeetingReminder =
  typeof appCalendarMeetingReminders.$inferInsert;
export type AppCalendarMeetingAttendee =
  typeof appCalendarMeetingAttendees.$inferSelect;
export type NewAppCalendarMeetingAttendee =
  typeof appCalendarMeetingAttendees.$inferInsert;
export type AppCalendarMeetingNote =
  typeof appCalendarMeetingNotes.$inferSelect;
export type NewAppCalendarMeetingNote =
  typeof appCalendarMeetingNotes.$inferInsert;
export type AppCalendarSettings = typeof appCalendarSettings.$inferSelect;
export type NewAppCalendarSettings = typeof appCalendarSettings.$inferInsert;
export type AppCalendarRecurringMeeting =
  typeof appCalendarRecurringMeetings.$inferSelect;
export type NewAppCalendarRecurringMeeting =
  typeof appCalendarRecurringMeetings.$inferInsert;
export type AppCalendarSyncLog = typeof appCalendarSyncLogs.$inferSelect;
export type NewAppCalendarSyncLog = typeof appCalendarSyncLogs.$inferInsert;

// Enum 타입들
export type CalendarView = (typeof appCalendarViewEnum.enumValues)[number];
export type CalendarMeetingStatus =
  (typeof appCalendarMeetingStatusEnum.enumValues)[number];
export type CalendarMeetingType =
  (typeof appCalendarMeetingTypeEnum.enumValues)[number];
export type CalendarReminderType =
  (typeof appCalendarReminderTypeEnum.enumValues)[number];
export type CalendarRecurrenceType =
  (typeof appCalendarRecurrenceTypeEnum.enumValues)[number];
export type CalendarSyncStatus =
  (typeof appCalendarSyncStatusEnum.enumValues)[number];
export type CalendarExternalSource =
  (typeof appCalendarExternalSourceEnum.enumValues)[number];

// 🎯 Calendar 특화 인터페이스 (Google Calendar 연동 준비)
import type { Meeting } from '~/lib/schema/core';

export interface CalendarMeetingOverview {
  meeting: Meeting;
  checklists: AppCalendarMeetingChecklist[];
  reminders: AppCalendarMeetingReminder[];
  attendees: AppCalendarMeetingAttendee[];
  notes: AppCalendarMeetingNote[];
  recurring?: AppCalendarRecurringMeeting;
  // 🌐 Google Calendar 연동 정보
  syncInfo?: {
    status: CalendarSyncStatus;
    externalSource: CalendarExternalSource;
    externalEventId?: string;
    lastSyncAt?: Date;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: CalendarMeetingType;
  status: CalendarMeetingStatus;
  location?: string;
  clientName?: string;
  isRecurring: boolean;
  // 🌐 Google Calendar 연동 정보
  externalSource: CalendarExternalSource;
  externalEventId?: string;
  syncStatus: CalendarSyncStatus;
}

export interface CalendarFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  types?: CalendarMeetingType[];
  statuses?: CalendarMeetingStatus[];
  clients?: string[];
  showCompleted?: boolean;
  showCancelled?: boolean;
  // 🌐 Google Calendar 필터 추가
  externalSources?: CalendarExternalSource[];
  syncStatuses?: CalendarSyncStatus[];
}

// 🌐 Google Calendar 연동 관련 인터페이스
export interface GoogleCalendarSettings {
  enabled: boolean;
  calendarId?: string;
  syncDirection: 'to_google' | 'from_google' | 'bidirectional';
  autoSync: boolean;
  syncInterval: number; // 분 단위
  conflictResolution: 'local_wins' | 'google_wins' | 'manual';
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  recurrence?: string[];
}

// 이전 네이밍과의 호환성을 위한 타입 alias (Deprecated - 새 코드에서 사용 금지)
/** @deprecated Use AppCalendarMeetingTemplate instead */
export type CalendarMeetingTemplate = AppCalendarMeetingTemplate;
/** @deprecated Use AppCalendarMeetingChecklist instead */
export type CalendarMeetingChecklist = AppCalendarMeetingChecklist;
/** @deprecated Use AppCalendarMeetingReminder instead */
export type CalendarMeetingReminder = AppCalendarMeetingReminder;
/** @deprecated Use AppCalendarMeetingAttendee instead */
export type CalendarMeetingAttendee = AppCalendarMeetingAttendee;
/** @deprecated Use AppCalendarMeetingNote instead */
export type CalendarMeetingNote = AppCalendarMeetingNote;
/** @deprecated Use AppCalendarSettings instead */
export type CalendarSettings = AppCalendarSettings;
/** @deprecated Use AppCalendarRecurringMeeting instead */
export type CalendarRecurringMeeting = AppCalendarRecurringMeeting;
