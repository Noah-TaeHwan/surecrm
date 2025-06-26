import { google, calendar_v3 } from 'googleapis';
import { db } from '~/lib/core/db';
import { appCalendarSettings, appCalendarSyncLogs, meetings } from './schema';
import { eq, desc, and } from 'drizzle-orm';
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
    // 프로덕션에서 확실히 작동하도록 하드코딩된 접근 방식 사용
    let redirectUri = 'http://localhost:5173/api/google/calendar/callback'; // 기본값

    // 다양한 방법으로 프로덕션 환경 감지
    try {
      const isProduction =
        process.env.NODE_ENV === 'production' ||
        process.env.VERCEL_ENV === 'production' ||
        process.env.VERCEL === '1' ||
        (typeof window !== 'undefined' &&
          (window.location.hostname.includes('vercel.app') ||
            window.location.hostname.includes('surecrm.pro')));

      if (isProduction) {
        redirectUri = 'https://surecrm.pro/api/google/calendar/callback';
      }

      // 디버깅용 로그
      console.log('🔍 GoogleCalendarService 초기화:', {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL: process.env.VERCEL,
        PRODUCTION_URL: process.env.PRODUCTION_URL,
        APP_URL: process.env.APP_URL,
        isProduction: isProduction,
        redirectUri: redirectUri,
        hostname:
          typeof window !== 'undefined'
            ? window.location.hostname
            : 'server-side',
      });
    } catch (error) {
      console.error('❌ 환경 감지 오류:', error);
      // 에러 발생 시 환경 변수만으로 판단
      if (
        process.env.NODE_ENV === 'production' ||
        process.env.VERCEL_ENV === 'production'
      ) {
        redirectUri = 'https://surecrm.pro/api/google/calendar/callback';
      }
    }

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
    try {
      const settings = await db
        .select()
        .from(appCalendarSettings)
        .where(eq(appCalendarSettings.agentId, agentId))
        .limit(1);

      return settings[0] || null;
    } catch (error: any) {
      // 웹훅 필드가 없을 때 발생하는 에러를 안전하게 처리
      if (
        error.message?.includes('webhook_channel_id') ||
        (error.message?.includes('column') &&
          error.message?.includes('does not exist'))
      ) {
        console.warn(
          '⚠️ 웹훅 필드가 아직 마이그레이션되지 않음, 기존 설정만 조회'
        );

        // 웹훅 필드 없이 기본 설정만 조회
        try {
          const basicSettings = await db
            .select({
              agentId: appCalendarSettings.agentId,
              googleAccessToken: appCalendarSettings.googleAccessToken,
              googleRefreshToken: appCalendarSettings.googleRefreshToken,
              googleTokenExpiresAt: appCalendarSettings.googleTokenExpiresAt,
              googleCalendarSync: appCalendarSettings.googleCalendarSync,
              syncStatus: appCalendarSettings.syncStatus,
              lastSyncAt: appCalendarSettings.lastSyncAt,
              createdAt: appCalendarSettings.createdAt,
              updatedAt: appCalendarSettings.updatedAt,
            })
            .from(appCalendarSettings)
            .where(eq(appCalendarSettings.agentId, agentId))
            .limit(1);

          const setting = basicSettings[0];
          if (setting) {
            // 웹훅 필드를 null로 추가하여 호환성 유지
            return {
              ...setting,
              webhookChannelId: null,
              webhookResourceId: null,
              webhookExpiresAt: null,
            };
          }
          return null;
        } catch (basicError) {
          console.error('기본 설정 조회도 실패:', basicError);
          return null;
        }
      }

      // 다른 에러는 그대로 throw
      throw error;
    }
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

    // 토큰 만료 확인 및 자동 갱신
    await this.ensureValidToken(agentId);

    return this.oauth2Client;
  }

  // 🔄 토큰 자동 갱신 기능
  private async ensureValidToken(agentId: string) {
    try {
      const settings = await this.getCalendarSettings(agentId);
      if (!settings?.googleTokenExpiresAt) {
        return; // 만료 시간 정보가 없으면 그대로 진행
      }

      const expiresAt = new Date(settings.googleTokenExpiresAt);
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      // 토큰이 5분 내에 만료되면 갱신
      if (expiresAt <= fiveMinutesFromNow) {
        console.log('🔄 토큰 만료 임박, 자동 갱신 시작:', agentId);
        await this.refreshTokens(agentId);
      }
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error);
      // 갱신 실패해도 기존 토큰으로 시도
    }
  }

  // 🔄 토큰 갱신
  private async refreshTokens(agentId: string) {
    try {
      const settings = await this.getCalendarSettings(agentId);
      if (!settings?.googleRefreshToken) {
        throw new Error('리프레시 토큰이 없습니다');
      }

      const refreshToken = Buffer.from(
        settings.googleRefreshToken,
        'base64'
      ).toString();

      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (credentials.access_token) {
        // 새 토큰을 DB에 저장
        const encryptedAccessToken = Buffer.from(
          credentials.access_token
        ).toString('base64');

        await db
          .update(appCalendarSettings)
          .set({
            googleAccessToken: encryptedAccessToken,
            googleTokenExpiresAt: credentials.expiry_date
              ? new Date(credentials.expiry_date)
              : null,
            updatedAt: new Date(),
          })
          .where(eq(appCalendarSettings.agentId, agentId));

        console.log('✅ 토큰 갱신 성공:', agentId);
      }
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error);

      // 토큰 갱신 실패 시 연동 상태를 실패로 변경
      await db
        .update(appCalendarSettings)
        .set({
          syncStatus: 'sync_failed',
          updatedAt: new Date(),
        })
        .where(eq(appCalendarSettings.agentId, agentId));

      throw error;
    }
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

      return events.map(event => this.convertGoogleEventToCalendarEvent(event));
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
  // SureCRM 미팅 정보를 구글 캘린더 메모로 포맷팅
  private formatMeetingForGoogleCalendar(meeting: any): string {
    const sections = [];

    // 📋 메모 부분 (기본 설명)
    if (meeting.description) {
      sections.push(`📝 미팅 메모:\n${meeting.description}`);
    }

    // 💼 영업 정보 섹션 개선
    const salesInfo = [];

    if ((meeting as any).priority) {
      const priorityMap: any = {
        urgent: '🔴 긴급',
        high: '🟠 높음',
        medium: '🔵 보통',
        low: '⚪ 낮음',
      };
      salesInfo.push(
        `우선순위: ${priorityMap[(meeting as any).priority] || '🔵 보통'}`
      );
    }

    if ((meeting as any).contactMethod) {
      const methodMap: any = {
        phone: '📞 전화',
        video: '📹 화상통화',
        in_person: '👥 대면',
        hybrid: '🔄 혼합',
      };
      salesInfo.push(
        `연락 방법: ${methodMap[(meeting as any).contactMethod] || '👥 대면'}`
      );
    }

    if ((meeting as any).expectedOutcome) {
      const outcomeMap: any = {
        information_gathering: '📊 정보 수집',
        needs_analysis: '🔍 니즈 분석',
        proposal_presentation: '📋 제안서 발표',
        objection_handling: '💭 이의 제기 해결',
        contract_discussion: '📄 계약 논의',
        closing: '✅ 계약 체결',
        relationship_building: '🤝 관계 구축',
      };
      salesInfo.push(
        `기대 성과: ${
          outcomeMap[(meeting as any).expectedOutcome] || '📊 정보 수집'
        }`
      );
    }

    if (
      (meeting as any).estimatedCommission &&
      (meeting as any).estimatedCommission > 0
    ) {
      salesInfo.push(
        `예상 수수료: ₩${(meeting as any).estimatedCommission.toLocaleString('ko-KR')}`
      );
    }

    if ((meeting as any).productInterest) {
      const productMap: any = {
        life: '💗 생명보험',
        health: '🏥 건강보험',
        auto: '🚗 자동차보험',
        prenatal: '👶 태아보험',
        property: '🏠 재산보험',
        pension: '💰 연금보험',
        investment: '📈 투자형 보험',
        multiple: '🎯 복합 상품',
      };
      salesInfo.push(
        `관심 상품: ${
          productMap[(meeting as any).productInterest] || '💗 생명보험'
        }`
      );
    }

    if ((meeting as any).reminder) {
      const reminderMap: any = {
        none: '알림 없음',
        '5_minutes': '5분 전',
        '15_minutes': '15분 전',
        '30_minutes': '30분 전',
        '1_hour': '1시간 전',
        '1_day': '1일 전',
      };
      salesInfo.push(
        `알림 설정: ${reminderMap[(meeting as any).reminder] || '30분 전'}`
      );
    }

    if (salesInfo.length > 0) {
      sections.push(
        `💼 영업 정보:\n${salesInfo.map(info => `• ${info}`).join('\n')}`
      );
    }

    // 🔗 시스템 정보
    sections.push(`\n🔗 SureCRM 연동 미팅`);
    sections.push(`동기화 시간: ${new Date().toLocaleString('ko-KR')}`);

    return sections.join('\n\n');
  }

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

      const formattedDescription = this.formatMeetingForGoogleCalendar(meeting);

      const event: calendar_v3.Schema$Event = {
        summary: meeting.title,
        description: formattedDescription,
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

      const formattedDescription = this.formatMeetingForGoogleCalendar(meeting);

      const event: calendar_v3.Schema$Event = {
        summary: meeting.title,
        description: formattedDescription,
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
      console.log('🗑️ 구글 캘린더 이벤트 삭제 시작:', {
        agentId,
        googleEventId,
        timestamp: new Date().toISOString(),
      });

      await this.setupAuthClient(agentId);
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      // 삭제 전 이벤트 존재 여부 확인
      try {
        const existingEvent = await calendar.events.get({
          calendarId: 'primary',
          eventId: googleEventId,
        });
        console.log('📍 삭제 대상 이벤트 확인:', {
          eventId: googleEventId,
          title: existingEvent.data.summary,
          status: existingEvent.data.status,
        });
      } catch (getError: any) {
        if (getError.code === 404) {
          console.log(
            '⚠️ 삭제하려는 이벤트가 이미 존재하지 않음:',
            googleEventId
          );
          return true; // 이미 삭제된 것으로 간주
        }
        console.log(
          '🔍 이벤트 존재 확인 실패 (삭제 계속 진행):',
          getError.message
        );
      }

      // 실제 삭제 실행
      const deleteResponse = await calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
      });

      console.log('✅ 구글 캘린더 삭제 API 응답:', {
        status: deleteResponse.status,
        statusText: deleteResponse.statusText,
        data: deleteResponse.data,
        eventId: googleEventId,
      });

      // 삭제 후 확인 (삭제되었다면 404 에러가 발생해야 함)
      try {
        await calendar.events.get({
          calendarId: 'primary',
          eventId: googleEventId,
        });
        console.log('⚠️ 삭제 후에도 이벤트가 여전히 존재함:', googleEventId);
        return false;
      } catch (verifyError: any) {
        if (verifyError.code === 404) {
          console.log(
            '✅ 삭제 확인됨 - 이벤트가 더 이상 존재하지 않음:',
            googleEventId
          );
          await this.logSyncSuccess(agentId, null, 'to_google', googleEventId);
          return true;
        } else {
          console.log('🔍 삭제 확인 중 예상치 못한 오류:', verifyError.message);
          // 삭제 API가 성공했으므로 true 반환
          await this.logSyncSuccess(agentId, null, 'to_google', googleEventId);
          return true;
        }
      }
    } catch (error: any) {
      console.error('❌ 구글 이벤트 삭제 실패:', {
        eventId: googleEventId,
        error: error.message,
        code: error.code,
        details: error,
      });
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

  // 🔄 **양방향 동기화 엔진**
  async performFullSync(agentId: string): Promise<boolean> {
    try {
      console.log('🔄 전체 동기화 시작:', agentId);

      const settings = await this.getCalendarSettings(agentId);
      if (!settings?.googleCalendarSync) {
        console.log('동기화가 비활성화되어 있습니다:', agentId);
        return true;
      }

      // 동기화 시작 상태로 변경
      await this.updateSyncStatus(agentId, 'syncing');

      const syncStartTime = new Date();

      // 양방향 동기화 실행
      await Promise.allSettled([
        this.syncFromGoogle(agentId),
        this.syncToGoogle(agentId),
      ]);

      // 동기화 완료 상태로 변경
      await db
        .update(appCalendarSettings)
        .set({
          syncStatus: 'synced',
          lastSyncAt: syncStartTime,
          updatedAt: new Date(),
        })
        .where(eq(appCalendarSettings.agentId, agentId));

      console.log('✅ 전체 동기화 완료:', agentId);
      return true;
    } catch (error) {
      console.error('❌ 전체 동기화 실패:', error);
      await this.updateSyncStatus(agentId, 'sync_failed');
      return false;
    }
  }

  // 🔽 구글 → SureCRM 동기화
  private async syncFromGoogle(agentId: string) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      // 구글 캘린더 이벤트 조회
      const googleEvents = await this.fetchEvents(
        agentId,
        thirtyDaysAgo,
        oneYearFromNow
      );

      console.log(`📥 구글에서 ${googleEvents.length}개 이벤트 조회`);

      // 동기화 로그 기록
      for (const event of googleEvents) {
        try {
          await this.logSyncSuccess(
            agentId,
            null,
            'from_google',
            event.googleEventId
          );
        } catch (logError) {
          console.error('동기화 로그 기록 실패:', logError);
        }
      }
    } catch (error) {
      console.error('❌ 구글 → SureCRM 동기화 실패:', error);
      await this.logSyncError(agentId, 'from_google', error);
    }
  }

  // 🔼 SureCRM → 구글 동기화
  private async syncToGoogle(agentId: string) {
    try {
      // 현재 월의 SureCRM 미팅들 조회 (calendar-data.ts 사용)
      const today = new Date();
      const { getMeetingsByMonth } = await import('./calendar-data');
      const meetings = await getMeetingsByMonth(
        agentId,
        today.getFullYear(),
        today.getMonth() + 1
      );

      console.log(`📤 SureCRM에서 ${meetings.length}개 미팅 확인`);

      // 구글 동기화 정보가 없는 미팅들을 구글에 생성
      for (const meeting of meetings) {
        if (!meeting.syncInfo?.externalEventId) {
          try {
            // CalendarMeeting을 Meeting 형식으로 변환
            const meetingData = {
              id: meeting.id,
              title: meeting.title,
              agentId,
              clientId: meeting.client.id,
              scheduledAt: new Date(`${meeting.date}T${meeting.time}`),
              duration: meeting.duration,
              location: meeting.location,
              description: meeting.description || '',
              meetingType: meeting.type,
              status: meeting.status,
            };

            const googleEventId = await this.createEventFromMeeting(
              agentId,
              meetingData as any
            );

            if (googleEventId) {
              // 동기화 로그 생성 (실제 Meeting 테이블 업데이트는 나중에 구현)
              await this.logSyncSuccess(
                agentId,
                meeting.id,
                'to_google',
                googleEventId
              );
            }
          } catch (error) {
            console.error('미팅 동기화 실패:', meeting.id, error);
          }
        }
      }
    } catch (error) {
      console.error('❌ SureCRM → 구글 동기화 실패:', error);
      await this.logSyncError(agentId, 'to_google', error);
    }
  }

  // 🔄 동기화 상태 업데이트
  private async updateSyncStatus(
    agentId: string,
    status:
      | 'not_synced'
      | 'syncing'
      | 'synced'
      | 'sync_failed'
      | 'sync_conflict'
  ) {
    try {
      await db
        .update(appCalendarSettings)
        .set({
          syncStatus: status,
          updatedAt: new Date(),
        })
        .where(eq(appCalendarSettings.agentId, agentId));
    } catch (error) {
      console.error('❌ 동기화 상태 업데이트 실패:', error);
    }
  }

  // 📊 동기화 통계 조회
  async getSyncStats(agentId: string) {
    try {
      const settings = await this.getCalendarSettings(agentId);

      // 최근 동기화 로그 조회
      const recentLogs = await db
        .select()
        .from(appCalendarSyncLogs)
        .where(eq(appCalendarSyncLogs.agentId, agentId))
        .orderBy(desc(appCalendarSyncLogs.createdAt))
        .limit(10);

      return {
        isConnected: !!settings?.googleAccessToken,
        lastSyncAt: settings?.lastSyncAt,
        syncStatus: settings?.syncStatus || 'not_synced',
        totalSyncLogs: recentLogs.length,
        recentLogs: recentLogs.slice(0, 5),
      };
    } catch (error) {
      console.error('❌ 동기화 통계 조회 실패:', error);
      return {
        isConnected: false,
        lastSyncAt: null,
        syncStatus: 'not_synced' as const,
        totalSyncLogs: 0,
        recentLogs: [],
      };
    }
  }

  // ⚔️ **충돌 감지 및 해결**
  async detectConflicts(agentId: string) {
    try {
      // 충돌 가능성이 있는 동기화 로그 조회
      const conflictLogs = await db
        .select()
        .from(appCalendarSyncLogs)
        .where(
          and(
            eq(appCalendarSyncLogs.agentId, agentId),
            eq(appCalendarSyncLogs.syncStatus, 'sync_conflict')
          )
        )
        .orderBy(desc(appCalendarSyncLogs.createdAt));

      return conflictLogs.map(log => ({
        eventId: log.externalEventId || log.meetingId || 'unknown',
        syncLogId: log.id,
        conflictData: log.syncResult,
        detectedAt: log.createdAt,
      }));
    } catch (error) {
      console.error('❌ 충돌 감지 실패:', error);
      return [];
    }
  }

  // ⚔️ 충돌 해결
  async resolveConflict(
    agentId: string,
    eventId: string,
    resolution: 'local' | 'google'
  ): Promise<boolean> {
    try {
      console.log(`🔧 충돌 해결 시작: ${eventId} -> ${resolution}`);

      if (resolution === 'google') {
        // 구글 캘린더 우선: 구글 → SureCRM 덮어쓰기
        await this.syncSpecificEventFromGoogle(agentId, eventId);
      } else {
        // SureCRM 우선: SureCRM → 구글 덮어쓰기
        await this.syncSpecificEventToGoogle(agentId, eventId);
      }

      // 충돌 해결 완료 로그
      await db.insert(appCalendarSyncLogs).values({
        agentId,
        meetingId: eventId.startsWith('google_') ? null : eventId,
        externalEventId: eventId.startsWith('google_') ? eventId : null,
        syncDirection: resolution === 'google' ? 'from_google' : 'to_google',
        syncStatus: 'synced',
        externalSource: 'google_calendar',
        syncResult: {
          conflictResolution: resolution,
          resolvedAt: new Date(),
          success: true,
        },
      });

      console.log(`✅ 충돌 해결 완료: ${eventId}`);
      return true;
    } catch (error) {
      console.error('❌ 충돌 해결 실패:', error);
      return false;
    }
  }

  // ⚔️ 모든 충돌 일괄 해결
  async resolveAllConflicts(
    agentId: string,
    resolution: 'local' | 'google'
  ): Promise<boolean> {
    try {
      const conflicts = await this.detectConflicts(agentId);

      console.log(
        `🔧 ${conflicts.length}개 충돌 일괄 해결 시작: ${resolution}`
      );

      const results = await Promise.allSettled(
        conflicts.map(conflict =>
          this.resolveConflict(agentId, conflict.eventId, resolution)
        )
      );

      const successCount = results.filter(
        r => r.status === 'fulfilled' && r.value === true
      ).length;

      console.log(
        `✅ 충돌 일괄 해결 완료: ${successCount}/${conflicts.length}`
      );
      return successCount === conflicts.length;
    } catch (error) {
      console.error('❌ 충돌 일괄 해결 실패:', error);
      return false;
    }
  }

  // 🔍 특정 이벤트 구글→SureCRM 동기화
  private async syncSpecificEventFromGoogle(agentId: string, eventId: string) {
    try {
      await this.setupAuthClient(agentId);
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const response = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId.replace('google_', ''),
      });

      if (response.data) {
        // 구글 이벤트를 SureCRM 형식으로 변환하여 업데이트
        // (실제 Meeting 테이블 업데이트 로직은 추후 구현)
        console.log('구글 이벤트로 SureCRM 업데이트:', response.data.summary);
      }
    } catch (error) {
      console.error('특정 이벤트 구글→SureCRM 동기화 실패:', error);
      throw error;
    }
  }

  // 🔍 특정 이벤트 SureCRM→구글 동기화
  private async syncSpecificEventToGoogle(agentId: string, meetingId: string) {
    try {
      // SureCRM 미팅 조회
      const { getMeetingsByMonth } = await import('./calendar-data');
      const today = new Date();
      const meetings = await getMeetingsByMonth(
        agentId,
        today.getFullYear(),
        today.getMonth() + 1
      );

      const meeting = meetings.find(m => m.id === meetingId);
      if (!meeting) {
        throw new Error('미팅을 찾을 수 없습니다');
      }

      // 구글 이벤트 업데이트
      const meetingData = {
        id: meeting.id,
        title: meeting.title,
        agentId,
        clientId: meeting.client.id,
        scheduledAt: new Date(`${meeting.date}T${meeting.time}`),
        duration: meeting.duration,
        location: meeting.location,
        description: meeting.description || '',
        meetingType: meeting.type,
        status: meeting.status,
      };

      await this.updateEvent(agentId, meetingId, meetingData as any);
      console.log('SureCRM 미팅으로 구글 업데이트:', meeting.title);
    } catch (error) {
      console.error('특정 이벤트 SureCRM→구글 동기화 실패:', error);
      throw error;
    }
  }

  // 🔔 **웹훅 채널 관리**

  // 웹훅 채널 생성
  async createWebhookChannel(agentId: string): Promise<boolean> {
    try {
      await this.setupAuthClient(agentId);
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const channelId = `surecrm_calendar_${agentId}_${Date.now()}`;
      const webhookUrl = `${
        process.env.VITE_APP_URL || 'https://surecrm.pro'
      }/api/google/calendar/webhook`;

      console.log('🔔 웹훅 채널 생성 시작:', { channelId, webhookUrl });

      const response = await calendar.events.watch({
        calendarId: 'primary',
        requestBody: {
          id: channelId,
          type: 'web_hook',
          address: webhookUrl,
          token:
            process.env.GOOGLE_WEBHOOK_VERIFY_TOKEN ||
            'surecrm_calendar_webhook',
          params: {
            ttl: '86400', // 24시간
          },
        },
      });

      if (response.data) {
        // 채널 정보를 설정에 저장
        await db
          .update(appCalendarSettings)
          .set({
            webhookChannelId: channelId,
            webhookResourceId: response.data.resourceId,
            webhookExpiresAt: response.data.expiration
              ? new Date(parseInt(response.data.expiration))
              : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후
            updatedAt: new Date(),
          })
          .where(eq(appCalendarSettings.agentId, agentId));

        console.log('✅ 웹훅 채널 생성 완료:', channelId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ 웹훅 채널 생성 실패:', error);
      return false;
    }
  }

  // 웹훅 채널 삭제
  async deleteWebhookChannel(agentId: string): Promise<boolean> {
    try {
      const settings = await this.getCalendarSettings(agentId);

      if (!settings?.webhookChannelId || !settings?.webhookResourceId) {
        console.log('🔔 삭제할 웹훅 채널이 없음');
        return true;
      }

      await this.setupAuthClient(agentId);
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      console.log('🔔 웹훅 채널 삭제 시작:', settings.webhookChannelId);

      await calendar.channels.stop({
        requestBody: {
          id: settings.webhookChannelId,
          resourceId: settings.webhookResourceId,
        },
      });

      // 설정에서 채널 정보 제거
      await db
        .update(appCalendarSettings)
        .set({
          webhookChannelId: null,
          webhookResourceId: null,
          webhookExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(appCalendarSettings.agentId, agentId));

      console.log('✅ 웹훅 채널 삭제 완료');
      return true;
    } catch (error) {
      console.error('❌ 웹훅 채널 삭제 실패:', error);
      return false;
    }
  }

  // 웹훅 채널 갱신 (만료 전 자동 갱신)
  async renewWebhookChannel(agentId: string): Promise<boolean> {
    try {
      console.log('🔄 웹훅 채널 갱신 시작');

      // 기존 채널 삭제
      await this.deleteWebhookChannel(agentId);

      // 새 채널 생성
      const success = await this.createWebhookChannel(agentId);

      if (success) {
        console.log('✅ 웹훅 채널 갱신 완료');
      } else {
        console.error('❌ 웹훅 채널 갱신 실패');
      }

      return success;
    } catch (error) {
      console.error('❌ 웹훅 채널 갱신 실패:', error);
      return false;
    }
  }

  // 웹훅 채널 상태 확인
  async checkWebhookStatus(agentId: string): Promise<{
    isActive: boolean;
    channelId?: string;
    expiresAt?: Date;
    needsRenewal: boolean;
  }> {
    try {
      const settings = await this.getCalendarSettings(agentId);

      if (!settings?.webhookChannelId || !settings?.webhookExpiresAt) {
        return {
          isActive: false,
          needsRenewal: true,
        };
      }

      const now = new Date();
      const expiresAt = new Date(settings.webhookExpiresAt);
      const hoursUntilExpiry =
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

      return {
        isActive: expiresAt > now,
        channelId: settings.webhookChannelId,
        expiresAt: expiresAt,
        needsRenewal: hoursUntilExpiry < 2, // 2시간 전에 갱신
      };
    } catch (error) {
      console.error('❌ 웹훅 상태 확인 실패:', error);
      return {
        isActive: false,
        needsRenewal: true,
      };
    }
  }

  // 🔔 실시간 알림 처리 (웹훅 수신 시 호출)
  async handleWebhookNotification(
    channelId: string,
    resourceId: string,
    resourceState: string
  ): Promise<boolean> {
    try {
      // 채널 ID에서 agentId 추출
      const agentIdMatch = channelId.match(/^surecrm_calendar_([^_]+)_\d+$/);

      if (!agentIdMatch) {
        console.warn('⚠️ 유효하지 않은 채널 ID:', channelId);
        return false;
      }

      const agentId = agentIdMatch[1];

      console.log('🔔 실시간 알림 처리:', {
        agentId,
        resourceState,
        channelId,
      });

      // 변경사항에 따른 동기화 실행
      switch (resourceState) {
        case 'exists':
          // 캘린더 변경사항 발생 → 즉시 동기화
          await this.performFullSync(agentId);
          break;

        case 'not_exists':
          // 리소스 삭제 → 로컬 정리
          console.log('📝 구글 이벤트 삭제 감지');
          break;

        default:
          console.log('🔄 기타 웹훅 상태:', resourceState);
      }

      // 웹훅 처리 로그
      await db.insert(appCalendarSyncLogs).values({
        agentId,
        syncDirection: 'from_google',
        syncStatus: 'synced',
        externalSource: 'google_calendar',
        syncResult: {
          webhookProcessing: true,
          resourceState,
          channelId,
          resourceId,
          processedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error('❌ 웹훅 알림 처리 실패:', error);
      return false;
    }
  }
}
