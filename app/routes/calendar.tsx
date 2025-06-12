// import type { Route } from './+types/calendar'; // 타입 생성 후 활성화
namespace Route {
  export type LoaderArgs = any;
  export type ActionArgs = any;
  export type MetaArgs = any;
  export type ComponentProps = any;
}
import CalendarPage from '~/features/calendar/pages/calendar-page';
import { requireAuth } from '~/lib/auth/middleware';
import {
  getMeetingsByMonth,
  getClientsByAgent,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  toggleChecklistItem,
} from '~/features/calendar/lib/calendar-data';

// 캘린더 페이지 loader
export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 인증 확인
    const user = await requireAuth(request);
    const agentId = user.id;

    // 현재 날짜 정보
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();

    // 실제 데이터베이스에서 데이터 조회 + 구글 캘린더 이벤트
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    const [meetings, clients, googleData] = await Promise.allSettled([
      getMeetingsByMonth(agentId, currentYear, currentMonth),
      getClientsByAgent(agentId),
      // 구글 캘린더 설정 및 이벤트 조회 (실패해도 기본값 반환)
      (async () => {
        try {
          const { GoogleCalendarService } = await import(
            '~/features/calendar/lib/google-calendar-service'
          );
          const googleService = new GoogleCalendarService();

          // 설정 정보 조회
          const settings = await googleService.getCalendarSettings(agentId);
          const isConnected = !!settings?.googleAccessToken;

          // 연동된 경우에만 이벤트 조회
          let events: any[] = [];
          if (isConnected) {
            events = await googleService.fetchEvents(
              agentId,
              startOfMonth,
              endOfMonth
            );
          }

          return {
            settings: {
              isConnected,
              lastSyncAt: settings?.updatedAt,
              googleEventsCount: events.length,
            },
            events,
          };
        } catch (error) {
          console.log('구글 캘린더 데이터 조회 실패 (무시):', error);
          return {
            settings: { isConnected: false },
            events: [],
          };
        }
      })(),
    ]);

    // 구글 데이터 추출
    const googleResult =
      googleData.status === 'fulfilled'
        ? googleData.value
        : {
            settings: { isConnected: false },
            events: [],
          };

    // 구글 이벤트를 SureCRM 미팅 형식으로 변환
    const googleMeetings = googleResult.events.map((event: any) => ({
      id: event.id,
      title: event.title,
      client: { id: 'google', name: '구글 캘린더', phone: '' },
      date: event.startTime.toISOString().split('T')[0],
      time: event.startTime.toTimeString().slice(0, 5),
      duration: Math.floor(
        (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60)
      ),
      type: 'google',
      location: event.location || '',
      description: event.description,
      status: 'scheduled' as const,
      checklist: [],
      notes: [],
      syncInfo: {
        status: event.syncStatus,
        externalSource: 'google_calendar' as const,
        externalEventId: event.googleEventId,
        lastSyncAt: event.lastSyncAt.toISOString(),
      },
    }));

    // SureCRM 미팅과 구글 이벤트 병합
    const allMeetings = [
      ...(meetings.status === 'fulfilled' ? meetings.value : []),
      ...googleMeetings,
    ];

    return {
      meetings: allMeetings,
      clients: clients.status === 'fulfilled' ? clients.value : [],
      googleCalendarSettings: googleResult.settings,
      currentMonth,
      currentYear,
      agentId,
      googleEventsCount: googleMeetings.length,
    };
  } catch (error) {
    console.error('📅 Calendar 데이터 로딩 실패:', error);

    // 에러 시 빈 배열 반환
    const today = new Date();
    return {
      meetings: [],
      clients: [],
      currentMonth: today.getMonth() + 1,
      currentYear: today.getFullYear(),
      agentId: 'error-fallback',
      error:
        error instanceof Error ? error.message : '데이터를 불러올 수 없습니다.',
    };
  }
}

// 캘린더 액션 처리
export async function action({ request }: Route.ActionArgs) {
  try {
    // 인증 확인
    const user = await requireAuth(request);
    const agentId = user.id;

    const formData = await request.formData();
    const actionType = formData.get('actionType') as string;

    switch (actionType) {
      case 'connectGoogleCalendar': {
        // 🔗 구글 캘린더 연동 시작 - OAuth URL로 리다이렉트
        try {
          const { GoogleCalendarService } = await import(
            '~/features/calendar/lib/google-calendar-service'
          );
          const googleService = new GoogleCalendarService();
          const authUrl = googleService.getAuthUrl(user.id);

          // OAuth URL로 리다이렉트
          return Response.redirect(authUrl, 302);
        } catch (error) {
          console.error('❌ 구글 연동 실패:', error);
          return {
            success: false,
            message: '구글 캘린더 연동을 시작할 수 없습니다.',
          };
        }
      }

      case 'createMeeting': {
        const title = formData.get('title') as string;
        const clientId = formData.get('clientId') as string;
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const duration = parseInt(formData.get('duration') as string);
        const meetingType = formData.get('type') as string;
        const location = formData.get('location') as string;
        const description = formData.get('description') as string;

        // 🎯 영업 정보 필드들
        const priority = formData.get('priority') as string;
        const expectedOutcome = formData.get('expectedOutcome') as string;
        const contactMethod = formData.get('contactMethod') as string;
        const estimatedCommission = formData.get(
          'estimatedCommission'
        ) as string;
        const productInterest = formData.get('productInterest') as string;

        // 🌐 구글 캘린더 연동 옵션들
        const syncToGoogle = formData.get('syncToGoogle') === 'true';
        const sendClientInvite = formData.get('sendClientInvite') === 'true';
        const reminder = formData.get('reminder') as string;

        // 예약 시간 계산 (scheduledAt 필드 사용)
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);

        const scheduledAt = new Date(year, month - 1, day, hour, minute);

        // SureCRM에서 미팅 생성
        const meeting = await createMeeting(agentId, {
          title,
          clientId,
          scheduledAt,
          duration, // 분 단위로 전달
          location,
          meetingType,
          description,
          // 🎯 새로운 영업 정보 필드들
          priority,
          expectedOutcome,
          contactMethod,
          estimatedCommission: estimatedCommission
            ? Number(estimatedCommission.replace(/[^0-9]/g, ''))
            : undefined,
          productInterest,
          // 🌐 구글 캘린더 연동 옵션들
          syncToGoogle,
          sendClientInvite,
          reminder,
        });

        // 🌐 구글 캘린더 동기화 (옵션이 활성화된 경우)
        let googleEventId = null;
        if (syncToGoogle && meeting) {
          try {
            const { GoogleCalendarService } = await import(
              '~/features/calendar/lib/google-calendar-service'
            );
            const googleService = new GoogleCalendarService();

            // 구글 캘린더에 이벤트 생성
            googleEventId = await googleService.createEventFromMeeting(
              agentId,
              meeting
            );

            if (googleEventId) {
              console.log('✅ 구글 캘린더 동기화 성공:', googleEventId);
            }
          } catch (error) {
            console.error('❌ 구글 캘린더 동기화 실패:', error);
            // 구글 캘린더 연동 실패해도 SureCRM 미팅 생성은 성공으로 처리
          }
        }

        const successMessage =
          syncToGoogle && googleEventId
            ? '미팅이 SureCRM과 구글 캘린더에 모두 생성되었습니다.'
            : syncToGoogle && !googleEventId
            ? '미팅은 SureCRM에 생성되었으나 구글 캘린더 동기화에 실패했습니다.'
            : '미팅이 성공적으로 생성되었습니다.';

        return {
          success: true,
          message: successMessage,
          googleSynced: !!googleEventId,
        };
      }

      case 'updateMeeting': {
        const meetingId = formData.get('meetingId') as string;
        const title = formData.get('title') as string;
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const duration = parseInt(formData.get('duration') as string);
        const location = formData.get('location') as string;
        const description = formData.get('description') as string;
        const status = formData.get('status') as string;

        // 🎯 영업 정보 필드들
        const priority = formData.get('priority') as string;
        const expectedOutcome = formData.get('expectedOutcome') as string;
        const contactMethod = formData.get('contactMethod') as string;
        const estimatedCommission = formData.get(
          'estimatedCommission'
        ) as string;
        const productInterest = formData.get('productInterest') as string;

        // 🌐 구글 캘린더 연동 옵션들
        const syncToGoogle = formData.get('syncToGoogle') === 'true';
        const sendClientInvite = formData.get('sendClientInvite') === 'true';
        const reminder = formData.get('reminder') as string;

        // 예약 시간 계산 (scheduledAt 필드 사용)
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);

        const scheduledAt = new Date(year, month - 1, day, hour, minute);

        await updateMeeting(meetingId, agentId, {
          title,
          scheduledAt,
          duration, // 분 단위로 전달
          location,
          description,
          status: status as any,
          // 🎯 새로운 영업 정보 필드들
          priority,
          expectedOutcome,
          contactMethod,
          estimatedCommission: estimatedCommission
            ? Number(estimatedCommission.replace(/[^0-9]/g, ''))
            : undefined,
          productInterest,
          // 🌐 구글 캘린더 연동 옵션들
          syncToGoogle,
          sendClientInvite,
          reminder,
        });

        return { success: true, message: '미팅이 성공적으로 수정되었습니다.' };
      }

      case 'deleteMeeting': {
        const meetingId = formData.get('meetingId') as string;

        await deleteMeeting(meetingId, agentId);

        return { success: true, message: '미팅이 성공적으로 삭제되었습니다.' };
      }

      case 'toggleChecklist': {
        const meetingId = formData.get('meetingId') as string;
        const checklistId = formData.get('checklistId') as string;

        await toggleChecklistItem(checklistId, meetingId, agentId);

        return { success: true, message: '체크리스트가 업데이트되었습니다.' };
      }

      default:
        return { success: false, message: '알 수 없는 액션입니다.' };
    }
  } catch (error) {
    console.error('📅 Calendar 액션 실행 실패:', error);
    return {
      success: false,
      message: '작업 중 오류가 발생했습니다. 다시 시도해주세요.',
    };
  }
}

// SEO 메타 정보
export function meta({ data }: Route.MetaArgs) {
  return [
    { title: '일정 관리 - SureCRM' },
    {
      name: 'description',
      content: '구글 캘린더 연동으로 고객 미팅과 일정을 효율적으로 관리합니다',
    },
    { name: 'keywords', content: '일정관리, 미팅, 구글캘린더, 고객관리, CRM' },
  ];
}

// 메인 캘린더 페이지 컴포넌트
export default function Calendar({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return <CalendarPage loaderData={loaderData} actionData={actionData} />;
}
