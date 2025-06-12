import { google, calendar_v3 } from 'googleapis';
import { db } from '~/lib/core/db';
import { appCalendarSettings, appCalendarSyncLogs, meetings } from './schema';
import { eq } from 'drizzle-orm';
import type { Meeting } from '~/lib/schema/core';

export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  source: 'google';
  sourceIcon: '📅';
  googleEventId: string;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'failed';
  lastSyncAt: Date;
}

export class GoogleCalendarService {
  private oauth2Client: any;

  constructor() {
    // 환경에 따른 올바른 redirect URI 설정 (구글 클라우드 콘솔과 일치)
    const redirectUri =
      process.env.NODE_ENV === 'production'
        ? 'https://surecrm-sigma.vercel.app/api/google/calendar/callback'
        : 'http://localhost:5173/api/google/calendar/callback';

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
  }

  // 1. OAuth 인증 URL 생성
  getAuthUrl(agentId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: agentId, // 상태로 사용자 ID 전달
      prompt: 'consent', // 항상 refresh token 받기
    });
  }

  // 2. 사용자의 캘린더 설정 조회
  async getCalendarSettings(agentId: string) {
    const settings = await db
      .select()
      .from(appCalendarSettings)
      .where(eq(appCalendarSettings.agentId, agentId))
      .limit(1);

    return settings[0] || null;
  }

  // 3. 토큰 복호화 및 OAuth 클라이언트 설정
  private async setupAuthClient(agentId: string) {
    const settings = await this.getCalendarSettings(agentId);
    if (!settings || !settings.googleAccessToken) {
      throw new Error('구글 캘린더 연동이 설정되지 않았습니다');
    }

    // 토큰 복호화 (Base64 디코딩)
    const accessToken = Buffer.from(
      settings.googleAccessToken,
      'base64'
    ).toString();
    const refreshToken = settings.googleRefreshToken
      ? Buffer.from(settings.googleRefreshToken, 'base64').toString()
      : null;

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: settings.googleTokenExpiresAt
        ? new Date(settings.googleTokenExpiresAt).getTime()
        : null,
    });

    return this.oauth2Client;
  }

  // 4. 구글 캘린더 이벤트 조회
  async fetchEvents(
    agentId: string,
    startTime: Date,
    endTime: Date
  ): Promise<GoogleCalendarEvent[]> {
    try {
      const settings = await this.getCalendarSettings(agentId);
      if (!settings?.googleCalendarSync) {
        return [];
      }

      await this.setupAuthClient(agentId);
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250, // 제한 설정
      });

      const events = response.data.items || [];

      return events.map((event) =>
        this.convertGoogleEventToCalendarEvent(event)
      );
    } catch (error) {
      console.error('❌ 구글 캘린더 이벤트 조회 실패:', error);
      await this.logSyncError(agentId, 'from_google', error);
      return [];
    }
  }

  // 5. 구글 이벤트 → SureCRM CalendarEvent 변환
  private convertGoogleEventToCalendarEvent(
    googleEvent: calendar_v3.Schema$Event
  ): GoogleCalendarEvent {
    const startTime = googleEvent.start?.dateTime
      ? new Date(googleEvent.start.dateTime)
      : new Date(googleEvent.start?.date || '');

    const endTime = googleEvent.end?.dateTime
      ? new Date(googleEvent.end.dateTime)
      : new Date(googleEvent.end?.date || '');

    return {
      id: `google_${googleEvent.id}`,
      title: googleEvent.summary || '제목 없음',
      description: googleEvent.description || '',
      startTime,
      endTime,
      location: googleEvent.location || '',
      source: 'google',
      sourceIcon: '📅',
      googleEventId: googleEvent.id!,
      syncStatus: 'synced',
      lastSyncAt: new Date(),
    };
  }

  // 6. SureCRM Meeting → Google Event 생성
  async createEventFromMeeting(
    agentId: string,
    meeting: Meeting
  ): Promise<string | null> {
    try {
      await this.setupAuthClient(agentId);
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const event: calendar_v3.Schema$Event = {
        summary: meeting.title,
        description: meeting.description || '',
        location: meeting.location || '',
        start: {
          dateTime: meeting.scheduledAt.toISOString(),
          timeZone: 'Asia/Seoul',
        },
        end: {
          dateTime: new Date(
            meeting.scheduledAt.getTime() + (meeting.duration || 60) * 60000
          ).toISOString(),
          timeZone: 'Asia/Seoul',
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      await this.logSyncSuccess(
        agentId,
        meeting.id,
        'to_google',
        response.data.id || undefined
      );
      return response.data.id || null;
    } catch (error) {
      console.error('❌ 구글 이벤트 생성 실패:', error);
      await this.logSyncError(agentId, 'to_google', error, meeting.id);
      return null;
    }
  }

  // 7. 구글 이벤트 업데이트
  async updateEvent(
    agentId: string,
    googleEventId: string,
    meeting: Meeting
  ): Promise<boolean> {
    try {
      await this.setupAuthClient(agentId);
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const event: calendar_v3.Schema$Event = {
        summary: meeting.title,
        description: meeting.description || '',
        location: meeting.location || '',
        start: {
          dateTime: meeting.scheduledAt.toISOString(),
          timeZone: 'Asia/Seoul',
        },
        end: {
          dateTime: new Date(
            meeting.scheduledAt.getTime() + (meeting.duration || 60) * 60000
          ).toISOString(),
          timeZone: 'Asia/Seoul',
        },
      };

      await calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        requestBody: event,
      });

      await this.logSyncSuccess(
        agentId,
        meeting.id,
        'to_google',
        googleEventId
      );
      return true;
    } catch (error) {
      console.error('❌ 구글 이벤트 업데이트 실패:', error);
      await this.logSyncError(agentId, 'to_google', error, meeting.id);
      return false;
    }
  }

  // 8. 구글 이벤트 삭제
  async deleteEvent(agentId: string, googleEventId: string): Promise<boolean> {
    try {
      await this.setupAuthClient(agentId);
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
      });

      await this.logSyncSuccess(agentId, null, 'to_google', googleEventId);
      return true;
    } catch (error) {
      console.error('❌ 구글 이벤트 삭제 실패:', error);
      await this.logSyncError(agentId, 'to_google', error);
      return false;
    }
  }

  // 9. 동기화 성공 로그
  private async logSyncSuccess(
    agentId: string,
    meetingId: string | null,
    direction: string,
    externalEventId?: string
  ) {
    try {
      await db.insert(appCalendarSyncLogs).values({
        agentId,
        meetingId: meetingId || null,
        syncDirection: direction,
        syncStatus: 'synced',
        externalSource: 'google_calendar',
        externalEventId,
        syncResult: { success: true, timestamp: new Date() },
      });
    } catch (error) {
      console.error('❌ 동기화 로그 저장 실패:', error);
    }
  }

  // 10. 동기화 실패 로그
  private async logSyncError(
    agentId: string,
    direction: string,
    error: any,
    meetingId?: string
  ) {
    try {
      await db.insert(appCalendarSyncLogs).values({
        agentId,
        meetingId: meetingId || null,
        syncDirection: direction,
        syncStatus: 'sync_failed',
        externalSource: 'google_calendar',
        errorMessage: error instanceof Error ? error.message : String(error),
        syncResult: { error: true, details: error, timestamp: new Date() },
      });
    } catch (logError) {
      console.error('❌ 에러 로그 저장 실패:', logError);
    }
  }

  // 11. 연동 해제
  async disconnectCalendar(agentId: string): Promise<boolean> {
    try {
      await db
        .update(appCalendarSettings)
        .set({
          googleCalendarSync: false,
          googleAccessToken: null,
          googleRefreshToken: null,
          googleTokenExpiresAt: null,
          syncStatus: 'not_synced',
          updatedAt: new Date(),
        })
        .where(eq(appCalendarSettings.agentId, agentId));

      return true;
    } catch (error) {
      console.error('❌ 구글 캘린더 연동 해제 실패:', error);
      return false;
    }
  }
}
