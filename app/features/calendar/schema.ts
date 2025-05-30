// Calendar 기능에 특화된 스키마
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
  foreignKey,
  unique,
  date,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { profiles, clients, meetings, teams } from '~/lib/schema';

// 🗓️ Calendar Enums - 캘린더 관련 열거형 (core에 없는 것들만)
export const calendarView = pgEnum('calendar_view', [
  'month',
  'week',
  'day',
  'agenda',
]);

export const meetingStatus = pgEnum('meeting_status', [
  'scheduled',
  'completed',
  'cancelled',
  'rescheduled',
]);

export const meetingType = pgEnum('meeting_type', [
  'first_consultation',
  'product_explanation',
  'contract_review',
  'follow_up',
  'other',
]);

export const reminderType = pgEnum('reminder_type', [
  'none',
  '5_minutes',
  '15_minutes',
  '30_minutes',
  '1_hour',
  '1_day',
]);

export const recurrenceType = pgEnum('recurrence_type', [
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
]);

// Calendar 특화 테이블들

// Meeting Templates (미팅 템플릿)
export const meetingTemplates = pgTable('meeting_templates', {
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
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Meeting Checklists (미팅별 체크리스트)
export const meetingChecklists = pgTable('meeting_checklists', {
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
});

// Meeting Reminders (미팅 알림)
export const meetingReminders = pgTable('meeting_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  meetingId: uuid('meeting_id')
    .notNull()
    .references(() => meetings.id, { onDelete: 'cascade' }),
  reminderType: reminderType('reminder_type').notNull(),
  reminderTime: timestamp('reminder_time', { withTimezone: true }).notNull(),
  isSent: boolean('is_sent').default(false).notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Meeting Attendees (미팅 참석자)
export const meetingAttendees = pgTable('meeting_attendees', {
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
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Meeting Notes (미팅 노트)
export const meetingNotes = pgTable('meeting_notes', {
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

// Calendar Settings (캘린더 설정)
export const calendarSettings = pgTable('calendar_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id')
    .notNull()
    .unique()
    .references(() => profiles.id),
  defaultView: calendarView('default_view').default('month').notNull(),
  workingHours: jsonb('working_hours'), // { start: "09:00", end: "18:00", days: [1,2,3,4,5] }
  timeZone: text('time_zone').default('Asia/Seoul').notNull(),
  googleCalendarSync: boolean('google_calendar_sync').default(false).notNull(),
  defaultMeetingDuration: integer('default_meeting_duration')
    .default(60)
    .notNull(),
  defaultReminder: reminderType('default_reminder')
    .default('30_minutes')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Recurring Meetings (반복 미팅)
export const recurringMeetings = pgTable('recurring_meetings', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentMeetingId: uuid('parent_meeting_id')
    .notNull()
    .references(() => meetings.id),
  recurrenceType: recurrenceType('recurrence_type').notNull(),
  recurrenceInterval: integer('recurrence_interval').default(1).notNull(), // 매 N일/주/월
  recurrenceEnd: timestamp('recurrence_end', { withTimezone: true }),
  maxOccurrences: integer('max_occurrences'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations
export const meetingTemplatesRelations = relations(
  meetingTemplates,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [meetingTemplates.agentId],
      references: [profiles.id],
    }),
  })
);

export const meetingChecklistsRelations = relations(
  meetingChecklists,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [meetingChecklists.meetingId],
      references: [meetings.id],
    }),
  })
);

export const meetingRemindersRelations = relations(
  meetingReminders,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [meetingReminders.meetingId],
      references: [meetings.id],
    }),
  })
);

export const meetingAttendeesRelations = relations(
  meetingAttendees,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [meetingAttendees.meetingId],
      references: [meetings.id],
    }),
    client: one(clients, {
      fields: [meetingAttendees.clientId],
      references: [clients.id],
    }),
    agent: one(profiles, {
      fields: [meetingAttendees.agentId],
      references: [profiles.id],
    }),
  })
);

export const meetingNotesRelations = relations(meetingNotes, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingNotes.meetingId],
    references: [meetings.id],
  }),
  agent: one(profiles, {
    fields: [meetingNotes.agentId],
    references: [profiles.id],
  }),
}));

export const calendarSettingsRelations = relations(
  calendarSettings,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [calendarSettings.agentId],
      references: [profiles.id],
    }),
  })
);

export const recurringMeetingsRelations = relations(
  recurringMeetings,
  ({ one }) => ({
    parentMeeting: one(meetings, {
      fields: [recurringMeetings.parentMeetingId],
      references: [meetings.id],
    }),
  })
);

// Calendar 특화 타입들
export type MeetingTemplate = typeof meetingTemplates.$inferSelect;
export type NewMeetingTemplate = typeof meetingTemplates.$inferInsert;
export type MeetingChecklist = typeof meetingChecklists.$inferSelect;
export type NewMeetingChecklist = typeof meetingChecklists.$inferInsert;
export type MeetingReminder = typeof meetingReminders.$inferSelect;
export type NewMeetingReminder = typeof meetingReminders.$inferInsert;
export type MeetingAttendee = typeof meetingAttendees.$inferSelect;
export type NewMeetingAttendee = typeof meetingAttendees.$inferInsert;
export type MeetingNote = typeof meetingNotes.$inferSelect;
export type NewMeetingNote = typeof meetingNotes.$inferInsert;
export type CalendarSettings = typeof calendarSettings.$inferSelect;
export type NewCalendarSettings = typeof calendarSettings.$inferInsert;
export type RecurringMeeting = typeof recurringMeetings.$inferSelect;
export type NewRecurringMeeting = typeof recurringMeetings.$inferInsert;

export type ReminderType = (typeof reminderType.enumValues)[number];
export type RecurrenceType = (typeof recurrenceType.enumValues)[number];
export type CalendarView = (typeof calendarView.enumValues)[number];

// Calendar 특화 인터페이스
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  clientName?: string;
  location?: string;
  type: string;
  status: string;
  color?: string;
}

export interface CalendarFilter {
  types: string[];
  statuses: string[];
  clients: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface WorkingHours {
  start: string; // "09:00"
  end: string; // "18:00"
  days: number[]; // [1,2,3,4,5] (월-금)
  breaks?: {
    start: string;
    end: string;
  }[];
}

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number;
  endDate?: Date;
  maxOccurrences?: number;
  weekDays?: number[]; // 주간 반복시 요일 지정
  monthDay?: number; // 월간 반복시 날짜 지정
}

// 🏗️ Calendar Tables - 캘린더 기능 테이블들

// 캘린더 설정
export const featuresCalendarSettings = pgTable(
  'features_calendar_settings',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    defaultView: calendarView('default_view').default('month').notNull(),
    workingHours: jsonb('working_hours'),
    timeZone: text('time_zone').default('Asia/Seoul').notNull(),
    googleCalendarSync: boolean('google_calendar_sync')
      .default(false)
      .notNull(),
    defaultMeetingDuration: integer('default_meeting_duration')
      .default(60)
      .notNull(),
    defaultReminder: reminderType('default_reminder')
      .default('30_minutes')
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [profiles.id],
      name: 'features_calendar_settings_agent_id_common_profiles_id_fk',
    }),
    unique('features_calendar_settings_agent_id_unique').on(table.agentId),
  ]
);

// 미팅/이벤트
export const featuresCalendarMeetings = pgTable(
  'features_calendar_meetings',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    clientId: uuid('client_id').notNull(),
    agentId: uuid('agent_id').notNull(),
    title: text().notNull(),
    description: text(),
    startTime: timestamp('start_time', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    endTime: timestamp('end_time', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    location: text(),
    meetingType: meetingType('meeting_type').notNull(),
    status: meetingStatus().default('scheduled').notNull(),
    googleEventId: text('google_event_id'),
    notes: text(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [profiles.id],
      name: 'features_calendar_meetings_agent_id_common_profiles_id_fk',
    }),
    // clientId는 clients 테이블과 연결되므로 나중에 추가
  ]
);

// 미팅 참석자
export const featuresCalendarMeetingAttendees = pgTable(
  'features_calendar_meeting_attendees',
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
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [profiles.id],
      name: 'features_calendar_meeting_attendees_agent_id_common_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [featuresCalendarMeetings.id],
      name: 'features_calendar_meeting_attendees_meeting_id_features_calendar_meetings_id_fk',
    }).onDelete('cascade'),
    // clientId는 clients 테이블과 연결되므로 나중에 추가
  ]
);

// 미팅 노트
export const featuresCalendarMeetingNotes = pgTable(
  'features_calendar_meeting_notes',
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
  (table) => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [profiles.id],
      name: 'features_calendar_meeting_notes_agent_id_common_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [featuresCalendarMeetings.id],
      name: 'features_calendar_meeting_notes_meeting_id_features_calendar_meetings_id_fk',
    }).onDelete('cascade'),
  ]
);

// 미팅 알림
export const featuresCalendarMeetingReminders = pgTable(
  'features_calendar_meeting_reminders',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    meetingId: uuid('meeting_id').notNull(),
    reminderType: reminderType('reminder_type').notNull(),
    reminderTime: timestamp('reminder_time', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    isSent: boolean('is_sent').default(false).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [featuresCalendarMeetings.id],
      name: 'features_calendar_meeting_reminders_meeting_id_features_calendar_meetings_id_fk',
    }).onDelete('cascade'),
  ]
);

// 미팅 템플릿
export const featuresCalendarMeetingTemplates = pgTable(
  'features_calendar_meeting_templates',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    name: text().notNull(),
    description: text(),
    defaultDuration: integer('default_duration').default(60).notNull(),
    defaultLocation: text('default_location'),
    checklist: jsonb(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [profiles.id],
      name: 'features_calendar_meeting_templates_agent_id_common_profiles_id_fk',
    }),
  ]
);

// 반복 미팅
export const featuresCalendarRecurringMeetings = pgTable(
  'features_calendar_recurring_meetings',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    parentMeetingId: uuid('parent_meeting_id').notNull(),
    recurrenceType: recurrenceType('recurrence_type').notNull(),
    recurrenceInterval: integer('recurrence_interval').default(1).notNull(),
    recurrenceEnd: timestamp('recurrence_end', {
      withTimezone: true,
      mode: 'string',
    }),
    maxOccurrences: integer('max_occurrences'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentMeetingId],
      foreignColumns: [featuresCalendarMeetings.id],
      name: 'features_calendar_recurring_meetings_parent_meeting_id_features_calendar_meetings_id_fk',
    }),
  ]
);

// 미팅 체크리스트
export const featuresCalendarMeetingChecklists = pgTable(
  'features_calendar_meeting_checklists',
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
  (table) => [
    foreignKey({
      columns: [table.meetingId],
      foreignColumns: [featuresCalendarMeetings.id],
      name: 'features_calendar_meeting_checklists_meeting_id_features_calendar_meetings_id_fk',
    }).onDelete('cascade'),
  ]
);

// 캘린더 이벤트 (미팅 외의 일반 이벤트)
export const featuresCalendarEvents = pgTable(
  'features_calendar_events',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    agentId: uuid('agent_id').notNull(),
    teamId: uuid('team_id'),
    title: text().notNull(),
    description: text(),
    startTime: timestamp('start_time', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    endTime: timestamp('end_time', {
      withTimezone: true,
      mode: 'string',
    }).notNull(),
    location: text(),
    isAllDay: boolean('is_all_day').default(false).notNull(),
    color: text().default('#3b82f6').notNull(),
    isPrivate: boolean('is_private').default(false).notNull(),
    googleEventId: text('google_event_id'),
    metadata: jsonb(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.agentId],
      foreignColumns: [profiles.id],
      name: 'features_calendar_events_agent_id_common_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.teamId],
      foreignColumns: [teams.id],
      name: 'features_calendar_events_team_id_common_teams_id_fk',
    }),
  ]
);

// 캘린더 공유 설정
export const featuresCalendarSharing = pgTable(
  'features_calendar_sharing',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    ownerId: uuid('owner_id').notNull(),
    sharedWithId: uuid('shared_with_id').notNull(),
    permission: text().default('view').notNull(), // 'view', 'edit', 'admin'
    canViewPrivate: boolean('can_view_private').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [profiles.id],
      name: 'features_calendar_sharing_owner_id_common_profiles_id_fk',
    }),
    foreignKey({
      columns: [table.sharedWithId],
      foreignColumns: [profiles.id],
      name: 'features_calendar_sharing_shared_with_id_common_profiles_id_fk',
    }),
    unique('features_calendar_sharing_owner_shared_unique').on(
      table.ownerId,
      table.sharedWithId
    ),
  ]
);
