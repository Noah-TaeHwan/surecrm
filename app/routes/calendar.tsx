// import type { Route } from './+types/calendar'; // 타입 생성 후 활성화
namespace Route {
  export type LoaderArgs = any;
  export type ActionArgs = any;
  export type MetaArgs = any;
  export type ComponentProps = any;
}
import CalendarPage from '~/features/calendar/pages/calendar-page';
import {
  getMeetingsByMonth,
  getClientsByAgent,
  updateMeeting,
  deleteMeeting,
  toggleChecklistItem,
} from '~/features/calendar/lib/calendar-data';
import { data } from 'react-router';

// 캘린더 페이지 loader
export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 구독 상태 확인 (트라이얼 만료 시 billing 페이지로 리다이렉트)
    const { requireActiveSubscription } = await import(
      '~/lib/auth/subscription-middleware.server'
    );
    const { user } = await requireActiveSubscription(request);
    const agentId = user.id;

    // 🔒 구글 캘린더 연동 필수 확인
    let googleSettings;
    try {
      const { GoogleCalendarService } = await import(
        '~/features/calendar/lib/google-calendar-service.server'
      );
      const googleService = new GoogleCalendarService();
      googleSettings = await googleService.getCalendarSettings(agentId);
    } catch (error) {
      console.log('구글 캘린더 설정 조회 실패:', error);
      googleSettings = null;
    }

    // 연동되지 않은 경우도 페이지는 접근 가능하되 빈 데이터와 연동 필요 플래그 반환
    if (!googleSettings?.googleAccessToken) {
      return {
        requiresGoogleConnection: true,
        meetings: [],
        clients: [],
        googleCalendarSettings: { isConnected: false },
        currentMonth: new Date().getMonth() + 1,
        currentYear: new Date().getFullYear(),
        agentId,
      };
    }

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
            '~/features/calendar/lib/google-calendar-service.server'
          );
          const googleService = new GoogleCalendarService();

          // 연동된 경우에만 이벤트 조회
          let events: any[] = [];
          events = await googleService.fetchEvents(
            agentId,
            startOfMonth,
            endOfMonth
          );

          return {
            settings: {
              isConnected: true,
              lastSyncAt: googleSettings?.updatedAt,
              googleEventsCount: events.length,
            },
            events,
          };
        } catch (error) {
          console.log('구글 캘린더 데이터 조회 실패 (무시):', error);
          return {
            settings: { isConnected: true },
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
            settings: { isConnected: true },
            events: [],
          };

    // 구글 이벤트를 SureCRM 미팅 형식으로 변환 (완전 통합 방식)
    const googleMeetings = googleResult.events.map((event: any) => {
      // 구글 이벤트 제목에서 미팅 타입 유추 시도
      const inferMeetingTypeFromTitle = (title: string): string => {
        const titleLower = title.toLowerCase();

        // 한국어 키워드 기반 타입 추론
        if (
          titleLower.includes('초회') ||
          titleLower.includes('첫') ||
          titleLower.includes('신규')
        ) {
          return 'first_consultation';
        }
        if (
          titleLower.includes('후속') ||
          titleLower.includes('팔로업') ||
          titleLower.includes('follow')
        ) {
          return 'follow_up';
        }
        if (
          titleLower.includes('상품') ||
          titleLower.includes('설명') ||
          titleLower.includes('presentation')
        ) {
          return 'product_explanation';
        }
        if (
          titleLower.includes('계약') &&
          (titleLower.includes('검토') || titleLower.includes('review'))
        ) {
          return 'contract_review';
        }
        if (
          titleLower.includes('계약') &&
          (titleLower.includes('체결') ||
            titleLower.includes('서명') ||
            titleLower.includes('signing'))
        ) {
          return 'contract_signing';
        }
        if (
          titleLower.includes('보험금') ||
          titleLower.includes('청구') ||
          titleLower.includes('claim')
        ) {
          return 'claim_support';
        }

        // 기본값: 기타 미팅
        return 'other';
      };

      return {
        id: event.id,
        title: event.title, // 구글 캘린더의 실제 이벤트 제목
        client: {
          id: 'google',
          name: event.title, // 구글 이벤트 제목을 클라이언트명으로 사용
          phone: '',
        },
        date: event.startTime.toISOString().split('T')[0],
        time: event.startTime.toTimeString().slice(0, 5),
        duration: Math.floor(
          (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60)
        ),
        type: inferMeetingTypeFromTitle(event.title), // 🎯 지능적 타입 추론
        location: event.location || '',
        description: event.description,
        status: 'scheduled' as const,
        checklist: [],
        notes: [],
        syncInfo: {
          status: event.syncStatus,
          externalSource: 'google' as const, // 'google_calendar' 대신 'google' 사용
          externalEventId: event.googleEventId,
          lastSyncAt: event.lastSyncAt.toISOString(),
        },
      };
    });

    // SureCRM 미팅과 구글 이벤트 병합
    const allMeetings = [
      ...(meetings.status === 'fulfilled' ? meetings.value : []),
      ...googleMeetings,
    ];

    return {
      requiresGoogleConnection: false,
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
      requiresGoogleConnection: false,
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
    // 구독 상태 확인
    const { requireActiveSubscription } = await import(
      '~/lib/auth/subscription-middleware.server'
    );
    const { user } = await requireActiveSubscription(request);
    const agentId = user.id;

    const formData = await request.formData();
    const actionType = formData.get('actionType') as string;

    switch (actionType) {
      case 'connectGoogleCalendar': {
        // 🔗 구글 캘린더 연동 시작 - OAuth URL로 리다이렉트
        try {
          const { GoogleCalendarService } = await import(
            '~/features/calendar/lib/google-calendar-service.server'
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

        // 🌐 구글 캘린더 연동 옵션들 (항상 true로 강제)
        const sendClientInvite = formData.get('sendClientInvite') === 'true';
        const reminder = formData.get('reminder') as string;

        // 예약 시간 계산
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        const scheduledAt = new Date(year, month - 1, day, hour, minute);

        // 🌐 구글 캘린더에 직접 생성 (단일 소스 방식)
        try {
          const { GoogleCalendarService } = await import(
            '~/features/calendar/lib/google-calendar-service.server'
          );
          const googleService = new GoogleCalendarService();

          // 구글 캘린더 연동 상태 확인
          const settings = await googleService.getCalendarSettings(agentId);

          if (!settings?.googleAccessToken) {
            return {
              success: false,
              message:
                '구글 캘린더 연동이 필요합니다. 설정에서 구글 계정을 연결해주세요.',
              requiresGoogleConnection: true,
            };
          }

          // 클라이언트 정보 조회 (구글 이벤트 설명에 포함용)
          const { getClientsByAgent } = await import(
            '~/features/calendar/lib/calendar-data'
          );
          const clients = await getClientsByAgent(agentId);
          const selectedClient = clients.find(c => c.id === clientId);

          // 미팅 정보 구성 (구글 캘린더 이벤트용)
          const meetingData = {
            id: crypto.randomUUID(), // 임시 ID
            title,
            client: selectedClient || { id: clientId, name: '고객' },
            scheduledAt,
            duration,
            location,
            description,
            meetingType,
            // 영업 정보
            priority,
            expectedOutcome,
            contactMethod,
            estimatedCommission: estimatedCommission
              ? Number(estimatedCommission.replace(/[^0-9]/g, ''))
              : undefined,
            productInterest,
            // 메타데이터
            sendClientInvite,
            reminder,
          };

          // 구글 캘린더에 직접 생성
          const googleEventId = await googleService.createEventFromMeeting(
            agentId,
            meetingData as any
          );

          if (googleEventId) {
            return {
              success: true,
              message:
                '미팅이 구글 캘린더에 생성되었습니다. 곧 캘린더에 표시됩니다.',
              googleEventId,
              googleSynced: true,
            };
          } else {
            return {
              success: false,
              message:
                '구글 캘린더에 미팅 생성에 실패했습니다. 다시 시도해주세요.',
            };
          }
        } catch (error) {
          console.error('❌ 구글 캘린더 미팅 생성 실패:', error);
          return {
            success: false,
            message:
              '미팅 생성 중 오류가 발생했습니다. 구글 캘린더 연동 상태를 확인해주세요.',
            error: error instanceof Error ? error.message : '알 수 없는 오류',
          };
        }
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

        // 🔍 기존 미팅 정보 조회 (구글 이벤트 ID 확인용)
        const { getMeetingsByMonth } = await import(
          '~/features/calendar/lib/calendar-data'
        );
        const currentDate = new Date();
        const year2 = currentDate.getFullYear();
        const month2 = currentDate.getMonth() + 1;

        const meetings = await getMeetingsByMonth(agentId, year2, month2);
        const existingMeeting = meetings.find(m => m.id === meetingId);
        const googleEventId = existingMeeting?.syncInfo?.externalEventId;

        // 📝 SureCRM 미팅 업데이트
        const updatedMeeting = await updateMeeting(meetingId, agentId, {
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

        // 🌐 구글 캘린더 동기화 수행
        let googleUpdateResult = 'not_connected';

        if (syncToGoogle && googleEventId) {
          try {
            const { GoogleCalendarService } = await import(
              '~/features/calendar/lib/google-calendar-service.server'
            );
            const googleService = new GoogleCalendarService();

            // 구글 캘린더 연동 상태 확인
            const settings = await googleService.getCalendarSettings(agentId);

            if (settings?.googleAccessToken) {
              // 🎯 구글 캘린더 이벤트 업데이트
              const updateSuccess = await googleService.updateEvent(
                agentId,
                googleEventId,
                updatedMeeting as any
              );

              googleUpdateResult = updateSuccess ? 'updated' : 'sync_failed';
            } else {
              googleUpdateResult = 'not_connected';
            }
          } catch (googleError) {
            console.error('❌ 구글 캘린더 업데이트 실패:', googleError);
            googleUpdateResult = 'sync_failed';
          }
        }

        // 📢 성공 메시지 생성
        const getSuccessMessage = (result: string) => {
          switch (result) {
            case 'updated':
              return '미팅이 수정되고 구글 캘린더에도 업데이트되었습니다.';
            case 'sync_failed':
              return '미팅은 수정되었으나 구글 캘린더 업데이트에 실패했습니다.';
            case 'not_connected':
              return '미팅이 성공적으로 수정되었습니다.';
            default:
              return '미팅이 성공적으로 수정되었습니다.';
          }
        };

        const successMessage = getSuccessMessage(googleUpdateResult);

        return {
          success: true,
          message: successMessage,
          googleSynced: googleUpdateResult === 'updated',
        };
      }

      case 'deleteMeeting': {
        const meetingId = formData.get('meetingId') as string;

        try {
          // 🔍 구글 캘린더 이벤트 여부 확인
          if (meetingId.startsWith('google_')) {
            // 📅 구글 캘린더 이벤트 삭제
            const googleEventId = meetingId.replace('google_', '');

            try {
              const { GoogleCalendarService } = await import(
                '~/features/calendar/lib/google-calendar-service.server'
              );
              const googleService = new GoogleCalendarService();

              // 구글 캘린더 연동 상태 확인
              const settings = await googleService.getCalendarSettings(agentId);

              if (settings?.googleAccessToken) {
                // 🎯 구글 캘린더에서 직접 삭제
                const deleteSuccess = await googleService.deleteEvent(
                  agentId,
                  googleEventId
                );

                if (deleteSuccess) {
                  return {
                    success: true,
                    message: '구글 캘린더 이벤트가 삭제되었습니다.',
                  };
                } else {
                  return {
                    success: false,
                    message: '구글 캘린더 이벤트 삭제에 실패했습니다.',
                  };
                }
              } else {
                return {
                  success: false,
                  message: '구글 캘린더 연결이 필요합니다.',
                };
              }
            } catch (googleError) {
              console.error('❌ 구글 캘린더 이벤트 삭제 실패:', googleError);
              return {
                success: false,
                message: '구글 캘린더 이벤트 삭제 중 오류가 발생했습니다.',
              };
            }
          }

          // 📝 UUID 형식 검증 (SureCRM 미팅만)
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(meetingId)) {
            console.error('❌ 잘못된 미팅 ID 형식:', meetingId);
            return {
              success: false,
              message: '잘못된 미팅 ID 형식입니다.',
            };
          }

          // 🔍 SureCRM 미팅 정보와 구글 이벤트 ID 조회 (삭제 전)
          const { getMeetingsByMonth } = await import(
            '~/features/calendar/lib/calendar-data'
          );
          const currentDate = new Date();
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1;

          // 현재 월 미팅들 조회하여 해당 미팅 찾기
          const meetings = await getMeetingsByMonth(agentId, year, month);
          const targetMeeting = meetings.find(m => m.id === meetingId);

          let googleEventId = null;
          if (targetMeeting?.syncInfo?.externalEventId) {
            googleEventId = targetMeeting.syncInfo.externalEventId;
          }

          // 🗑️ SureCRM에서 미팅 삭제
          await deleteMeeting(meetingId, agentId);

          // 🌐 연동된 구글 캘린더 이벤트도 삭제 시도
          if (googleEventId) {
            try {
              const { GoogleCalendarService } = await import(
                '~/features/calendar/lib/google-calendar-service.server'
              );
              const googleService = new GoogleCalendarService();

              // 구글 캘린더 연동 상태 확인
              const settings = await googleService.getCalendarSettings(agentId);

              if (settings?.googleAccessToken) {
                // 🎯 실제 구글 이벤트 ID로 삭제
                const deleteSuccess = await googleService.deleteEvent(
                  agentId,
                  googleEventId
                );

                if (deleteSuccess) {
                  return {
                    success: true,
                    message:
                      '미팅이 삭제되었고 구글 캘린더에서도 제거되었습니다.',
                  };
                } else {
                  return {
                    success: true,
                    message:
                      '미팅은 삭제되었으나 구글 캘린더에서 제거하지 못했습니다.',
                  };
                }
              } else {
                return {
                  success: true,
                  message: '미팅이 성공적으로 삭제되었습니다.',
                };
              }
            } catch (googleError) {
              console.error('❌ 구글 캘린더 삭제 실패:', googleError);
              return {
                success: true,
                message:
                  '미팅은 삭제되었으나 구글 캘린더 동기화에 문제가 있었습니다.',
              };
            }
          } else {
            return {
              success: true,
              message: '미팅이 성공적으로 삭제되었습니다.',
            };
          }
        } catch (error) {
          console.error('❌ 미팅 삭제 실패:', error);
          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : '미팅 삭제 중 오류가 발생했습니다.',
          };
        }
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
  // 💫 페이지 접근은 항상 가능, 연동 상태만 전달
  return <CalendarPage loaderData={loaderData} actionData={actionData} />;
}
