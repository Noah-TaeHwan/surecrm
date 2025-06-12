import { meetings, clients, profiles } from '~/lib/schema';
import { createServerClient } from '~/lib/core/supabase';
import { db } from '~/lib/core/db';
import {
  appCalendarMeetingChecklists,
  appCalendarMeetingNotes,
  appCalendarSettings,
  appCalendarSyncLogs,
  type AppCalendarMeetingChecklist,
  type AppCalendarMeetingNote,
  type AppCalendarSettings,
  type CalendarSyncStatus,
  type CalendarExternalSource,
} from './schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';
import type { Meeting, Client, MeetingStatus } from '~/lib/schema';

// Calendar 페이지용 Meeting 타입 (컴포넌트와 호환) - Google Calendar 연동 필드 추가
export interface CalendarMeeting {
  id: string;
  title: string;
  client: {
    id: string;
    name: string;
    phone?: string;
  };
  date: string; // YYYY-MM-DD 형식
  time: string; // HH:MM 형식
  duration: number; // 분 단위
  type: string;
  location: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  checklist: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  notes?: Array<{
    id: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  // 🎯 영업 정보 필드들 추가
  priority?: string;
  expectedOutcome?: string;
  contactMethod?: string;
  estimatedCommission?: number;
  productInterest?: string;
  // 🌐 Google Calendar 연동 정보 추가
  syncInfo?: {
    status: CalendarSyncStatus;
    externalSource: CalendarExternalSource;
    externalEventId?: string;
    lastSyncAt?: string;
  };
  syncToGoogle?: boolean;
  sendClientInvite?: boolean;
  reminder?: string;
}

// Calendar 페이지용 Client 타입
export interface CalendarClient {
  id: string;
  name: string;
  phone?: string;
}

/**
 * 특정 월의 모든 미팅 조회 (체크리스트와 노트 포함) - Google Calendar 연동 정보 포함
 */
export async function getMeetingsByMonth(
  agentId: string,
  year: number,
  month: number
): Promise<CalendarMeeting[]> {
  try {
    // 해당 월의 시작일과 마지막일 계산
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const dbMeetings = await db
      .select({
        meeting: meetings,
        client: {
          id: clients.id,
          name: clients.fullName,
          phone: clients.phone,
        },
      })
      .from(meetings)
      .innerJoin(clients, eq(meetings.clientId, clients.id))
      .where(
        and(
          eq(meetings.agentId, agentId),
          gte(meetings.scheduledAt, startDate),
          lte(meetings.scheduledAt, endDate)
        )
      )
      .orderBy(asc(meetings.scheduledAt));

    // 각 미팅의 체크리스트, 노트, 동기화 정보를 병렬로 조회
    const meetingsWithDetails = await Promise.all(
      dbMeetings.map(async (row) => {
        const meeting = row.meeting;
        const scheduledTime = new Date(meeting.scheduledAt);
        const duration = meeting.duration; // 이미 분 단위로 저장됨

        // 체크리스트 조회 (새로운 테이블명 사용)
        const checklists = await db
          .select()
          .from(appCalendarMeetingChecklists)
          .where(eq(appCalendarMeetingChecklists.meetingId, meeting.id))
          .orderBy(asc(appCalendarMeetingChecklists.order));

        // 노트 조회 (새로운 테이블명 사용)
        const notes = await db
          .select()
          .from(appCalendarMeetingNotes)
          .where(eq(appCalendarMeetingNotes.meetingId, meeting.id))
          .orderBy(desc(appCalendarMeetingNotes.createdAt));

        // 🌐 Google Calendar 동기화 정보 조회
        const syncLogs = await db
          .select()
          .from(appCalendarSyncLogs)
          .where(eq(appCalendarSyncLogs.meetingId, meeting.id))
          .orderBy(desc(appCalendarSyncLogs.createdAt))
          .limit(1);

        const latestSyncLog = syncLogs[0];

        return {
          id: meeting.id,
          title: meeting.title,
          client: {
            id: row.client.id,
            name: row.client.name,
            phone: row.client.phone || undefined,
          },
          date: scheduledTime.toISOString().split('T')[0],
          time: scheduledTime.toTimeString().slice(0, 5),
          duration,
          type: meeting.meetingType,
          location: meeting.location || '',
          description: meeting.description || undefined,
          status: meeting.status as CalendarMeeting['status'],
          checklist: checklists.map((item) => ({
            id: item.id,
            text: item.text,
            completed: item.completed,
          })),
          notes: notes.map((note) => ({
            id: note.id,
            content: note.content,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt?.toISOString(),
          })),
          // 🎯 영업 정보 필드들
          priority: meeting.priority || undefined,
          expectedOutcome: meeting.expectedOutcome || undefined,
          contactMethod: meeting.contactMethod || undefined,
          estimatedCommission: meeting.estimatedCommission
            ? Number(meeting.estimatedCommission)
            : undefined,
          productInterest: meeting.productInterest || undefined,
          // 🌐 Google Calendar 동기화 정보
          syncInfo: latestSyncLog
            ? {
                status: latestSyncLog.syncStatus,
                externalSource: latestSyncLog.externalSource,
                externalEventId: latestSyncLog.externalEventId || undefined,
                lastSyncAt: latestSyncLog.createdAt.toISOString(),
              }
            : undefined,
          syncToGoogle: meeting.syncToGoogle || undefined,
          sendClientInvite: meeting.sendClientInvite || undefined,
          reminder: meeting.reminder || undefined,
        };
      })
    );

    return meetingsWithDetails;
  } catch (error) {
    console.error('미팅 조회 실패:', error);
    return [];
  }
}

/**
 * 특정 날짜 범위의 미팅 조회 (주간/일간 뷰용) - Google Calendar 연동 정보 포함
 */
export async function getMeetingsByDateRange(
  agentId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarMeeting[]> {
  try {
    const dbMeetings = await db
      .select({
        meeting: meetings,
        client: {
          id: clients.id,
          name: clients.fullName,
          phone: clients.phone,
        },
      })
      .from(meetings)
      .innerJoin(clients, eq(meetings.clientId, clients.id))
      .where(
        and(
          eq(meetings.agentId, agentId),
          gte(meetings.scheduledAt, startDate),
          lte(meetings.scheduledAt, endDate)
        )
      )
      .orderBy(asc(meetings.scheduledAt));

    // 각 미팅의 체크리스트, 노트, 동기화 정보를 병렬로 조회
    const meetingsWithDetails = await Promise.all(
      dbMeetings.map(async (row) => {
        const meeting = row.meeting;
        const scheduledTime = new Date(meeting.scheduledAt);
        const duration = meeting.duration; // 이미 분 단위로 저장됨

        // 체크리스트 조회 (새로운 테이블명 사용)
        const checklists = await db
          .select()
          .from(appCalendarMeetingChecklists)
          .where(eq(appCalendarMeetingChecklists.meetingId, meeting.id))
          .orderBy(asc(appCalendarMeetingChecklists.order));

        // 노트 조회 (새로운 테이블명 사용)
        const notes = await db
          .select()
          .from(appCalendarMeetingNotes)
          .where(eq(appCalendarMeetingNotes.meetingId, meeting.id))
          .orderBy(desc(appCalendarMeetingNotes.createdAt));

        // 🌐 Google Calendar 동기화 정보 조회
        const syncLogs = await db
          .select()
          .from(appCalendarSyncLogs)
          .where(eq(appCalendarSyncLogs.meetingId, meeting.id))
          .orderBy(desc(appCalendarSyncLogs.createdAt))
          .limit(1);

        const latestSyncLog = syncLogs[0];

        return {
          id: meeting.id,
          title: meeting.title,
          client: {
            id: row.client.id,
            name: row.client.name,
            phone: row.client.phone || undefined,
          },
          date: scheduledTime.toISOString().split('T')[0],
          time: scheduledTime.toTimeString().slice(0, 5),
          duration,
          type: meeting.meetingType,
          location: meeting.location || '',
          description: meeting.description || undefined,
          status: meeting.status as CalendarMeeting['status'],
          checklist: checklists.map((item) => ({
            id: item.id,
            text: item.text,
            completed: item.completed,
          })),
          notes: notes.map((note) => ({
            id: note.id,
            content: note.content,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt?.toISOString(),
          })),
          // 🎯 영업 정보 필드들
          priority: meeting.priority || undefined,
          expectedOutcome: meeting.expectedOutcome || undefined,
          contactMethod: meeting.contactMethod || undefined,
          estimatedCommission: meeting.estimatedCommission
            ? Number(meeting.estimatedCommission)
            : undefined,
          productInterest: meeting.productInterest || undefined,
          // 🌐 Google Calendar 동기화 정보
          syncInfo: latestSyncLog
            ? {
                status: latestSyncLog.syncStatus,
                externalSource: latestSyncLog.externalSource,
                externalEventId: latestSyncLog.externalEventId || undefined,
                lastSyncAt: latestSyncLog.createdAt.toISOString(),
              }
            : undefined,
          syncToGoogle: meeting.syncToGoogle || undefined,
          sendClientInvite: meeting.sendClientInvite || undefined,
          reminder: meeting.reminder || undefined,
        };
      })
    );

    return meetingsWithDetails;
  } catch (error) {
    console.error('미팅 조회 실패:', error);
    return [];
  }
}

/**
 * 에이전트의 모든 클라이언트 조회 (미팅 생성용)
 */
export async function getClientsByAgent(
  agentId: string
): Promise<CalendarClient[]> {
  try {
    const dbClients = await db
      .select({
        id: clients.id,
        name: clients.fullName,
        phone: clients.phone,
      })
      .from(clients)
      .where(eq(clients.agentId, agentId))
      .orderBy(asc(clients.fullName));

    return dbClients.map((client) => ({
      id: client.id,
      name: client.name,
      phone: client.phone || undefined,
    }));
  } catch (error) {
    console.error('클라이언트 조회 실패:', error);
    return [];
  }
}

/**
 * 새 미팅 생성 (기본 체크리스트 포함) - 스키마 컬럼명에 맞춰 수정
 */
export async function createMeeting(
  agentId: string,
  meetingData: {
    title: string;
    clientId: string;
    scheduledAt: Date;
    duration: number; // 분 단위
    location?: string;
    meetingType: string;
    description?: string;
    // 🎯 영업 정보 필드들 추가
    priority?: string;
    expectedOutcome?: string;
    contactMethod?: string;
    estimatedCommission?: number;
    productInterest?: string;
    // 🌐 구글 캘린더 연동 옵션들
    syncToGoogle?: boolean;
    sendClientInvite?: boolean;
    reminder?: string;
  }
) {
  try {
    const newMeeting = await db
      .insert(meetings)
      .values({
        agentId,
        title: meetingData.title,
        clientId: meetingData.clientId,
        scheduledAt: meetingData.scheduledAt,
        duration: meetingData.duration,
        location: meetingData.location,
        meetingType: meetingData.meetingType as any,
        description: meetingData.description,
        status: 'scheduled',
        // 🎯 새로운 영업 정보 필드들 저장
        priority: meetingData.priority,
        expectedOutcome: meetingData.expectedOutcome,
        contactMethod: meetingData.contactMethod,
        estimatedCommission: meetingData.estimatedCommission
          ? meetingData.estimatedCommission.toString()
          : null,
        productInterest: meetingData.productInterest,
        syncToGoogle: meetingData.syncToGoogle || false,
        sendClientInvite: meetingData.sendClientInvite || false,
        reminder: meetingData.reminder,
      })
      .returning();

    const meeting = newMeeting[0];

    // 미팅 유형별 기본 체크리스트 생성
    const defaultChecklists = getDefaultChecklistByType(
      meetingData.meetingType
    );

    if (defaultChecklists.length > 0) {
      await db.insert(appCalendarMeetingChecklists).values(
        defaultChecklists.map((item, index) => ({
          meetingId: meeting.id,
          text: item,
          completed: false,
          order: index + 1,
        }))
      );
    }

    return meeting;
  } catch (error) {
    console.error('미팅 생성 실패:', error);
    throw error;
  }
}

/**
 * 미팅 업데이트 - 스키마 컬럼명에 맞춰 수정
 */
export async function updateMeeting(
  meetingId: string,
  agentId: string,
  updateData: Partial<{
    title: string;
    scheduledAt: Date;
    duration: number; // 분 단위
    location: string;
    description: string;
    status: MeetingStatus;
    // 🎯 영업 정보 필드들 추가
    priority: string;
    expectedOutcome: string;
    contactMethod: string;
    estimatedCommission: number;
    productInterest: string;
    // 🌐 구글 캘린더 연동 옵션들
    syncToGoogle: boolean;
    sendClientInvite: boolean;
    reminder: string;
  }>
) {
  try {
    const updatedMeeting = await db
      .update(meetings)
      .set({
        ...updateData,
        // estimatedCommission은 decimal 타입이므로 문자열로 변환
        estimatedCommission: updateData.estimatedCommission
          ? updateData.estimatedCommission.toString()
          : null,
        updatedAt: new Date(),
      })
      .where(and(eq(meetings.id, meetingId), eq(meetings.agentId, agentId)))
      .returning();

    return updatedMeeting[0];
  } catch (error) {
    console.error('미팅 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 미팅 삭제
 */
export async function deleteMeeting(meetingId: string, agentId: string) {
  try {
    await db
      .delete(meetings)
      .where(and(eq(meetings.id, meetingId), eq(meetings.agentId, agentId)));

    return true;
  } catch (error) {
    console.error('미팅 삭제 실패:', error);
    throw error;
  }
}

/**
 * 체크리스트 항목 토글
 */
export async function toggleChecklistItem(
  checklistId: string,
  meetingId: string,
  agentId: string
) {
  try {
    // 먼저 해당 미팅이 에이전트의 것인지 확인
    const meeting = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, meetingId), eq(meetings.agentId, agentId)))
      .limit(1);

    if (meeting.length === 0) {
      throw new Error('권한이 없습니다.');
    }

    // 현재 체크리스트 상태 조회
    const currentItem = await db
      .select()
      .from(appCalendarMeetingChecklists)
      .where(eq(appCalendarMeetingChecklists.id, checklistId))
      .limit(1);

    if (currentItem.length === 0) {
      throw new Error('체크리스트 항목을 찾을 수 없습니다.');
    }

    // 상태 토글
    const updatedItem = await db
      .update(appCalendarMeetingChecklists)
      .set({
        completed: !currentItem[0].completed,
        updatedAt: new Date(),
      })
      .where(eq(appCalendarMeetingChecklists.id, checklistId))
      .returning();

    return updatedItem[0];
  } catch (error) {
    console.error('체크리스트 토글 실패:', error);
    throw error;
  }
}

/**
 * 미팅 노트 추가
 */
export async function addMeetingNote(
  meetingId: string,
  agentId: string,
  content: string,
  isPrivate: boolean = false
) {
  try {
    const newNote = await db
      .insert(appCalendarMeetingNotes)
      .values({
        meetingId,
        agentId,
        content,
        isPrivate,
      })
      .returning();

    return newNote[0];
  } catch (error) {
    console.error('노트 추가 실패:', error);
    throw error;
  }
}

/**
 * 미팅 유형별 기본 체크리스트 반환
 */
function getDefaultChecklistByType(meetingType: string): string[] {
  const checklistMap: Record<string, string[]> = {
    first_consultation: [
      '고객 정보 확인',
      '상담 자료 준비',
      '니즈 분석 시트 작성',
      '다음 미팅 일정 협의',
    ],
    product_explanation: [
      '상품 설명서 준비',
      '견적서 작성',
      '비교 상품 자료 준비',
      '고객 질문 사항 정리',
    ],
    contract_review: [
      '계약서 검토',
      '약관 설명',
      '서명 및 날인',
      '초회 보험료 수납',
    ],
    follow_up: [
      '기존 계약 현황 확인',
      '변경 사항 논의',
      '추가 상품 제안',
      '만족도 조사',
    ],
    other: ['미팅 목적 확인', '필요 자료 준비', '논의 사항 정리'],
  };

  return checklistMap[meetingType] || checklistMap.other;
}
