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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { profiles, clients, meetings } from '~/lib/supabase-schema';

// Enum 정의
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

export const userRoleEnum = pgEnum('user_role', [
  'agent',
  'team_admin',
  'system_admin',
]);

// Calendar 특화 Enum
export const reminderTypeEnum = pgEnum('reminder_type', [
  'none',
  '5_minutes',
  '15_minutes',
  '30_minutes',
  '1_hour',
  '1_day',
]);

export const recurrenceTypeEnum = pgEnum('recurrence_type', [
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
]);

export const calendarViewEnum = pgEnum('calendar_view', [
  'month',
  'week',
  'day',
  'agenda',
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

// Meeting Reminders (미팅 알림)
export const meetingReminders = pgTable('meeting_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  meetingId: uuid('meeting_id')
    .notNull()
    .references(() => meetings.id, { onDelete: 'cascade' }),
  reminderType: reminderTypeEnum('reminder_type').notNull(),
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
  defaultView: calendarViewEnum('default_view').default('month').notNull(),
  workingHours: jsonb('working_hours'), // { start: "09:00", end: "18:00", days: [1,2,3,4,5] }
  timeZone: text('time_zone').default('Asia/Seoul').notNull(),
  googleCalendarSync: boolean('google_calendar_sync').default(false).notNull(),
  defaultMeetingDuration: integer('default_meeting_duration')
    .default(60)
    .notNull(),
  defaultReminder: reminderTypeEnum('default_reminder')
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
  recurrenceType: recurrenceTypeEnum('recurrence_type').notNull(),
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

export type ReminderType = (typeof reminderTypeEnum.enumValues)[number];
export type RecurrenceType = (typeof recurrenceTypeEnum.enumValues)[number];
export type CalendarView = (typeof calendarViewEnum.enumValues)[number];

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
