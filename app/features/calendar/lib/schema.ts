// 📅 Calendar 기능 전용 스키마
// Prefix 네이밍 컨벤션: calendar_ 사용
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

// �� Calendar 특화 Enum (새로운 네이밍 컨벤션 적용)
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

// 🏷️ Calendar 특화 테이블들 (새로운 네이밍 컨벤션 적용)

// Calendar Meeting Templates (미팅 템플릿)
export const calendarMeetingTemplates = pgTable(
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
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Calendar Meeting Checklists (미팅별 체크리스트)
export const calendarMeetingChecklists = pgTable(
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

// Calendar Meeting Reminders (미팅 알림)
export const calendarMeetingReminders = pgTable(
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
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Calendar Meeting Attendees (미팅 참석자)
export const calendarMeetingAttendees = pgTable(
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
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// Calendar Meeting Notes (미팅 노트)
export const calendarMeetingNotes = pgTable('app_calendar_meeting_notes', {
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
export const calendarSettings = pgTable('app_calendar_settings', {
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
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Calendar Recurring Meetings (반복 미팅)
export const calendarRecurringMeetings = pgTable(
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
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

// 🔗 Relations (관계 정의)
export const calendarMeetingTemplatesRelations = relations(
  calendarMeetingTemplates,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [calendarMeetingTemplates.agentId],
      references: [profiles.id],
    }),
  })
);

export const calendarMeetingChecklistsRelations = relations(
  calendarMeetingChecklists,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [calendarMeetingChecklists.meetingId],
      references: [meetings.id],
    }),
  })
);

export const calendarMeetingRemindersRelations = relations(
  calendarMeetingReminders,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [calendarMeetingReminders.meetingId],
      references: [meetings.id],
    }),
  })
);

export const calendarMeetingAttendeesRelations = relations(
  calendarMeetingAttendees,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [calendarMeetingAttendees.meetingId],
      references: [meetings.id],
    }),
    client: one(clients, {
      fields: [calendarMeetingAttendees.clientId],
      references: [clients.id],
    }),
    agent: one(profiles, {
      fields: [calendarMeetingAttendees.agentId],
      references: [profiles.id],
    }),
  })
);

export const calendarMeetingNotesRelations = relations(
  calendarMeetingNotes,
  ({ one }) => ({
    meeting: one(meetings, {
      fields: [calendarMeetingNotes.meetingId],
      references: [meetings.id],
    }),
    agent: one(profiles, {
      fields: [calendarMeetingNotes.agentId],
      references: [profiles.id],
    }),
  })
);

export const calendarSettingsRelations = relations(
  calendarSettings,
  ({ one }) => ({
    agent: one(profiles, {
      fields: [calendarSettings.agentId],
      references: [profiles.id],
    }),
  })
);

export const calendarRecurringMeetingsRelations = relations(
  calendarRecurringMeetings,
  ({ one }) => ({
    parentMeeting: one(meetings, {
      fields: [calendarRecurringMeetings.parentMeetingId],
      references: [meetings.id],
    }),
  })
);

// 📝 Calendar 특화 타입들 (실제 코드와 일치)
export type CalendarMeetingTemplate =
  typeof calendarMeetingTemplates.$inferSelect;
export type NewCalendarMeetingTemplate =
  typeof calendarMeetingTemplates.$inferInsert;
export type CalendarMeetingChecklist =
  typeof calendarMeetingChecklists.$inferSelect;
export type NewCalendarMeetingChecklist =
  typeof calendarMeetingChecklists.$inferInsert;
export type CalendarMeetingReminder =
  typeof calendarMeetingReminders.$inferSelect;
export type NewCalendarMeetingReminder =
  typeof calendarMeetingReminders.$inferInsert;
export type CalendarMeetingAttendee =
  typeof calendarMeetingAttendees.$inferSelect;
export type NewCalendarMeetingAttendee =
  typeof calendarMeetingAttendees.$inferInsert;
export type CalendarMeetingNote = typeof calendarMeetingNotes.$inferSelect;
export type NewCalendarMeetingNote = typeof calendarMeetingNotes.$inferInsert;
export type CalendarSettings = typeof calendarSettings.$inferSelect;
export type NewCalendarSettings = typeof calendarSettings.$inferInsert;
export type CalendarRecurringMeeting =
  typeof calendarRecurringMeetings.$inferSelect;
export type NewCalendarRecurringMeeting =
  typeof calendarRecurringMeetings.$inferInsert;

export type CalendarView = (typeof appCalendarViewEnum.enumValues)[number];
export type CalendarMeetingStatus =
  (typeof appCalendarMeetingStatusEnum.enumValues)[number];
export type CalendarMeetingType =
  (typeof appCalendarMeetingTypeEnum.enumValues)[number];
export type CalendarReminderType =
  (typeof appCalendarReminderTypeEnum.enumValues)[number];
export type CalendarRecurrenceType =
  (typeof appCalendarRecurrenceTypeEnum.enumValues)[number];

// 🎯 Calendar 특화 인터페이스
import type { Meeting } from '~/lib/schema';

export interface CalendarMeetingOverview {
  meeting: Meeting;
  checklists: CalendarMeetingChecklist[];
  reminders: CalendarMeetingReminder[];
  attendees: CalendarMeetingAttendee[];
  notes: CalendarMeetingNote[];
  recurring?: CalendarRecurringMeeting;
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
}
