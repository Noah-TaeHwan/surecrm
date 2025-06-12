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

    // 실제 데이터베이스에서 데이터 조회
    const [meetings, clients] = await Promise.allSettled([
      getMeetingsByMonth(agentId, currentYear, currentMonth),
      getClientsByAgent(agentId),
    ]);

    return {
      meetings: meetings.status === 'fulfilled' ? meetings.value : [],
      clients: clients.status === 'fulfilled' ? clients.value : [],
      currentMonth,
      currentYear,
      agentId,
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
      case 'createMeeting': {
        const title = formData.get('title') as string;
        const clientId = formData.get('clientId') as string;
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const duration = parseInt(formData.get('duration') as string);
        const meetingType = formData.get('type') as string;
        const location = formData.get('location') as string;
        const description = formData.get('description') as string;

        // 예약 시간 계산 (scheduledAt 필드 사용)
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);

        const scheduledAt = new Date(year, month - 1, day, hour, minute);

        await createMeeting(agentId, {
          title,
          clientId,
          scheduledAt,
          duration, // 분 단위로 전달
          location,
          meetingType,
          description,
        });

        return { success: true, message: '미팅이 성공적으로 생성되었습니다.' };
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
